/**
 * Bug Scraper
 *
 * Scrapes LEGO products from bug.co.il
 */

import { BaseScraper } from '../base-scraper'
import type { ScrapedProduct } from '../../types'

export class BugScraper extends BaseScraper {
  constructor() {
    super({
      baseUrl: 'https://www.bug.co.il',
      storeName: 'bug',
      requestDelay: 2000,
    })
  }

  async scrape(): Promise<ScrapedProduct[]> {
    this.clearProducts()

    try {
      // Bug.co.il LEGO category URL
      await this.scrapeCategory('/toys/lego')
    } catch (error) {
      console.error('Bug scraping error:', error)
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

        const productCards = $('.product-item, .product-box, [data-product-id]')

        if (productCards.length === 0) {
          hasMore = false
          continue
        }

        productCards.each((_, element) => {
          const $el = $(element)

          try {
            const sku = this.extractSku($el.text()) ||
                        $el.attr('data-product-id') ||
                        $el.find('[data-sku]').attr('data-sku')

            if (!sku) return

            const name = $el.find('.product-name, .title, h3').first().text().trim()

            // Only LEGO products
            if (!name.toLowerCase().includes('lego') && !name.includes('לגו')) return

            const priceText = $el.find('.price, .current-price').first().text()
            const originalPriceText = $el.find('.old-price, .was-price').first().text()

            const price = this.parsePrice(priceText)
            if (price === 0) return

            const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : undefined

            const relativeUrl = $el.find('a').first().attr('href') || ''
            const url = relativeUrl.startsWith('http')
              ? relativeUrl
              : `${this.config.baseUrl}${relativeUrl}`

            const imageUrl = $el.find('img').first().attr('src') ||
                            $el.find('img').first().attr('data-src')

            const stockText = $el.find('.stock-status, .availability').text().toLowerCase()
            const inStock = !stockText.includes('אזל') && !stockText.includes('out')

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
        const nextPage = $('a.next, .pagination .next, [rel="next"]')
        hasMore = nextPage.length > 0 && page < 15

        page++
        await this.delay()
      } catch (error) {
        console.error(`Error scraping Bug page ${page}:`, error)
        hasMore = false
      }
    }
  }
}
