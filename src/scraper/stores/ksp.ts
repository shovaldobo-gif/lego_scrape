/**
 * KSP Scraper
 *
 * Scrapes LEGO products from ksp.co.il
 * KSP uses a combination of server-rendered HTML and AJAX for loading products
 */

import { BaseScraper } from '../base-scraper'
import type { ScrapedProduct } from '../../types'

interface KspProductData {
  sku: string
  name: string
  price: number
  originalPrice?: number
  inStock: boolean
  url: string
  imageUrl?: string
}

export class KspScraper extends BaseScraper {
  // KSP category IDs for LEGO products
  private readonly categoryIds = {
    lego: '2458', // Main LEGO category
  }

  constructor() {
    super({
      baseUrl: 'https://ksp.co.il',
      storeName: 'ksp',
      requestDelay: 2000,
    })
  }

  async scrape(): Promise<ScrapedProduct[]> {
    this.clearProducts()

    try {
      // KSP loads products via AJAX
      // Their API endpoint format: /api/category/{categoryId}
      await this.scrapeCategory(this.categoryIds.lego)
    } catch (error) {
      console.error('KSP scraping error:', error)
    }

    return this.getProducts()
  }

  private async scrapeCategory(categoryId: string): Promise<void> {
    let page = 1
    let hasMore = true

    while (hasMore) {
      try {
        // KSP typically uses this URL format for category pages
        const url = `/web/cat/${categoryId}?page=${page}`
        const $ = await this.fetchHtml(url)

        // Find all product cards
        const productCards = $('.g-slider-item, .product-item, [data-sku]')

        if (productCards.length === 0) {
          hasMore = false
          continue
        }

        productCards.each((_, element) => {
          const $el = $(element)

          try {
            const product = this.parseProductCard($, $el)
            if (product && product.sku) {
              this.addProduct(product)
            }
          } catch (err) {
            // Skip invalid products
          }
        })

        // Check if there are more pages
        const nextPage = $('a.next-page, .pagination .next')
        hasMore = nextPage.length > 0 && page < 20 // Safety limit

        page++
        await this.delay()
      } catch (error) {
        console.error(`Error scraping KSP page ${page}:`, error)
        hasMore = false
      }
    }
  }

  private parseProductCard($: cheerio.CheerioAPI, $el: cheerio.Cheerio<cheerio.Element>): KspProductData | null {
    // Try different selector patterns used by KSP
    const sku = $el.attr('data-sku') ||
                $el.find('[data-sku]').attr('data-sku') ||
                this.extractSku($el.text())

    if (!sku) return null

    // Get product name
    const name = $el.find('.title, .product-name, h3, h4').first().text().trim() ||
                 $el.find('a').first().attr('title') || ''

    // Only process LEGO products
    if (!name.toLowerCase().includes('lego') && !name.includes('לגו')) {
      return null
    }

    // Get prices
    const priceText = $el.find('.price, .product-price, .final-price').first().text()
    const originalPriceText = $el.find('.old-price, .original-price, .was-price').first().text()

    const price = this.parsePrice(priceText)
    const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : undefined

    if (price === 0) return null

    // Get URL
    const relativeUrl = $el.find('a').first().attr('href') || `/web/item/${sku}`
    const url = relativeUrl.startsWith('http') ? relativeUrl : `${this.config.baseUrl}${relativeUrl}`

    // Get image
    const imageUrl = $el.find('img').first().attr('src') ||
                     $el.find('img').first().attr('data-src')

    // Check stock status
    const stockText = $el.find('.stock, .availability').text().toLowerCase()
    const inStock = !stockText.includes('אזל') && !stockText.includes('out of stock')

    return {
      sku,
      name: this.cleanProductName(name),
      price,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
      inStock,
      url,
      imageUrl,
    }
  }
}
