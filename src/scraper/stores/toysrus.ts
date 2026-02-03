/**
 * Toys R Us Israel Scraper
 *
 * Scrapes LEGO products from toysrus.co.il
 */

import { BaseScraper } from '../base-scraper'
import type { ScrapedProduct } from '../../types'

export class ToysRUsScraper extends BaseScraper {
  constructor() {
    super({
      baseUrl: 'https://www.toysrus.co.il',
      storeName: 'toys-r-us',
      requestDelay: 2000,
    })
  }

  async scrape(): Promise<ScrapedProduct[]> {
    this.clearProducts()

    try {
      // Toys R Us LEGO category
      await this.scrapeCategory('/brand/lego')
    } catch (error) {
      console.error('Toys R Us scraping error:', error)
    }

    return this.getProducts()
  }

  private async scrapeCategory(categoryPath: string): Promise<void> {
    let page = 1
    let hasMore = true

    while (hasMore) {
      try {
        const url = `${categoryPath}?page=${page}`
        const $ = await this.fetchHtml(url)

        const productCards = $('.product-item, .product-card, [data-product-id], .product-tile')

        if (productCards.length === 0) {
          hasMore = false
          continue
        }

        productCards.each((_, element) => {
          const $el = $(element)

          try {
            // Extract SKU
            const productText = $el.text()
            const sku = this.extractSku(productText) ||
                        $el.attr('data-product-id') ||
                        $el.attr('data-sku')

            if (!sku) return

            // Get product name
            const name = $el.find('.product-name, .product-title, h2, h3, h4')
              .first().text().trim()

            // Only LEGO products
            if (!name.toLowerCase().includes('lego') && !name.includes('לגו')) return

            // Get prices
            const priceText = $el.find('.price, .sale-price, .current-price').first().text()
            const originalPriceText = $el.find('.old-price, .was-price, .original-price').first().text()

            const price = this.parsePrice(priceText)
            if (price === 0) return

            const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : undefined

            // Get URL
            const relativeUrl = $el.find('a').first().attr('href') || ''
            const url = relativeUrl.startsWith('http')
              ? relativeUrl
              : `${this.config.baseUrl}${relativeUrl}`

            // Get image
            const imageUrl = $el.find('img.product-image, img').first().attr('src') ||
                            $el.find('img').first().attr('data-src') ||
                            $el.find('img').first().attr('data-lazy')

            // Stock status
            const stockText = $el.find('.stock, .availability, .in-stock, .out-of-stock')
              .text().toLowerCase()
            const hasOutOfStockClass = $el.hasClass('out-of-stock') ||
                                       $el.find('.out-of-stock').length > 0
            const inStock = !stockText.includes('אזל') &&
                           !stockText.includes('out of stock') &&
                           !stockText.includes('not available') &&
                           !hasOutOfStockClass

            this.addProduct({
              sku,
              name: this.cleanProductName(name),
              price,
              originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
              inStock,
              url,
              imageUrl,
            })
          } catch (err) {
            // Skip invalid products
          }
        })

        // Check for more pages
        const nextPage = $('a.next, .pagination .next, a[rel="next"], .load-more')
        hasMore = nextPage.length > 0 && page < 20

        page++
        await this.delay()
      } catch (error) {
        console.error(`Error scraping Toys R Us page ${page}:`, error)
        hasMore = false
      }
    }
  }
}
