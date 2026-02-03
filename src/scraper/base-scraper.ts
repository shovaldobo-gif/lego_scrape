/**
 * Base Scraper Class
 *
 * Provides common functionality for all store scrapers
 */

import axios, { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import type { ScrapedProduct, StoreName } from '../types'

export interface ScraperConfig {
  baseUrl: string
  storeName: StoreName
  requestDelay?: number
  userAgent?: string
  timeout?: number
}

export abstract class BaseScraper {
  protected config: ScraperConfig
  protected client: AxiosInstance
  protected products: ScrapedProduct[] = []

  constructor(config: ScraperConfig) {
    this.config = {
      requestDelay: 1500,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...config,
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
    })
  }

  /**
   * Main scraping method - must be implemented by each store scraper
   */
  abstract scrape(): Promise<ScrapedProduct[]>

  /**
   * Fetch HTML content from a URL
   */
  protected async fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const response = await this.client.get(url)
      return cheerio.load(response.data)
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      throw error
    }
  }

  /**
   * Fetch JSON data from an API endpoint
   */
  protected async fetchJson<T>(url: string): Promise<T> {
    try {
      const response = await this.client.get<T>(url, {
        headers: {
          'Accept': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching JSON from ${url}:`, error)
      throw error
    }
  }

  /**
   * Delay between requests
   */
  protected async delay(ms?: number): Promise<void> {
    const delayTime = ms || this.config.requestDelay
    return new Promise(resolve => setTimeout(resolve, delayTime))
  }

  /**
   * Parse price string to number
   */
  protected parsePrice(priceStr: string): number {
    // Remove currency symbols, commas, and whitespace
    const cleaned = priceStr
      .replace(/[₪$,\s]/g, '')
      .replace(/[^\d.]/g, '')

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  }

  /**
   * Extract LEGO SKU from text
   */
  protected extractSku(text: string): string | null {
    // LEGO SKUs are typically 4-6 digits
    const match = text.match(/\b(\d{4,6})\b/)
    return match ? match[1] : null
  }

  /**
   * Clean product name
   */
  protected cleanProductName(name: string): string {
    return name
      .replace(/\s+/g, ' ')
      .replace(/LEGO®?/gi, '')
      .replace(/לגו/g, '')
      .trim()
  }

  /**
   * Calculate discount percentage
   */
  protected calculateDiscount(original: number, current: number): number {
    if (original <= 0 || current >= original) return 0
    return Math.round(((original - current) / original) * 100)
  }

  /**
   * Add a scraped product
   */
  protected addProduct(product: Omit<ScrapedProduct, 'store' | 'scrapedAt'>): void {
    this.products.push({
      ...product,
      store: this.config.storeName,
      scrapedAt: new Date(),
    })
  }

  /**
   * Get all scraped products
   */
  protected getProducts(): ScrapedProduct[] {
    return this.products
  }

  /**
   * Clear scraped products
   */
  protected clearProducts(): void {
    this.products = []
  }
}
