/**
 * Ivory Scraper
 *
 * Scrapes LEGO products from ivory.co.il
 */

import { BaseScraper } from '../base-scraper'
import type { ScrapedProduct } from '../../types'

export class IvoryScraper extends BaseScraper {
  constructor() {
    super({
      baseUrl: 'https://www.ivory.co.il',
      storeName: 'ivory',
      requestDelay: 2000,
    })
  }

  async scrape(): Promise<ScrapedProduct[]> {
    this.clearProducts()

    try {
      // Ivory LEGO category
      await this.scrapeCategory('/catalog/toys/lego')
    } catch (error) {
      console.error('Ivory scraping error:', error)
    }

    return this.getProducts()
  }

  private async scrapeCategory(categoryPath: string): Promise<void> {
    let page = 1
    let hasMore = true

    while (hasMore) {
      try {
        const url = `${categoryPath}?p=${page}`
        const $ = await this.fetchHtml(url)

        const productCards = $('.product-item, .item, [data-product]')

        if (productCards.length === 0) {
          hasMore = false
          continue
        }

        productCards.each((_, element) => {
          const $el = $(element)

          try {
            // Extract product info
            const productText = $el.text()
            const sku = this.extractSku(productText) ||
                        $el.attr('data-sku') ||
                        $el.find('[data-sku]').attr('data-sku')

            if (!sku) return

            const name = $el.find('.product-name, .name, h2, h3').first().text().trim()

            // Filter for LEGO products only
            if (!name.toLowerCase().includes('lego') && !name.includes('לגו')) return

            // Get prices
            const priceText = $el.find('.price, .special-price, .final-price').first().text()
            const originalPriceText = $el.find('.old-price, .regular-price').first().text()

            const price = this.parsePrice(priceText)
            if (price === 0) return

            const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : undefined

            // Get URL
            const relativeUrl = $el.find('a.product-link, a').first().attr('href') || ''
            const url = relativeUrl.startsWith('http')
              ? relativeUrl
              : `${this.config.baseUrl}${relativeUrl}`

            // Get image
            const imageUrl = $el.find('img.product-image, img').first().attr('src') ||
                            $el.find('img').first().attr('data-src')

            // Stock status
            const stockElement = $el.find('.stock, .availability')
            const stockText = stockElement.text().toLowerCase()
            const inStock = !stockText.includes('אזל') &&
                           !stockText.includes('out of stock') &&
                           !stockElement.hasClass('out-of-stock')

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

        // Check pagination
        const nextPage = $('a.next, .pages .next, a[rel="next"]')
        hasMore = nextPage.length > 0 && page < 15

        page++
        await this.delay()
      } catch (error) {
        console.error(`Error scraping Ivory page ${page}:`, error)
        hasMore = false
      }
    }
  }
}
