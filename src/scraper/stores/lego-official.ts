/**
 * LEGO Official Store Scraper
 *
 * Scrapes products from the official LEGO.com Israeli store
 * Note: LEGO.com uses heavy JavaScript rendering, so we use their API
 */

import { BaseScraper } from '../base-scraper'
import type { ScrapedProduct } from '../../types'

interface LegoApiProduct {
  productCode: string
  name: string
  price: {
    centAmount: number
    currencyCode: string
    formattedValue?: string
  }
  listPrice?: {
    centAmount: number
    currencyCode: string
  }
  primaryImage?: string
  availability?: {
    text: string
    status: string
  }
  slug?: string
}

interface LegoApiResponse {
  results: LegoApiProduct[]
  pagination: {
    total: number
    offset: number
    count: number
  }
}

export class LegoOfficialScraper extends BaseScraper {
  private readonly apiBaseUrl = 'https://www.lego.com/api/graphql/ContentSearchQuery'
  private readonly locale = 'he-IL'
  private readonly pageSize = 36

  constructor() {
    super({
      baseUrl: 'https://www.lego.com',
      storeName: 'lego-official',
      requestDelay: 3000, // Be respectful to LEGO's servers
    })
  }

  async scrape(): Promise<ScrapedProduct[]> {
    this.clearProducts()

    try {
      // Scrape main categories
      const categories = [
        'star-wars',
        'technic',
        'city',
        'creator-expert',
        'harry-potter',
        'marvel',
        'architecture',
        'ideas',
        'speed-champions',
        'ninjago',
        'friends',
        'disney-princess',
        'duplo',
        'minecraft',
      ]

      for (const category of categories) {
        await this.scrapeCategory(category)
        await this.delay()
      }
    } catch (error) {
      console.error('LEGO Official scraping error:', error)
    }

    return this.getProducts()
  }

  private async scrapeCategory(category: string): Promise<void> {
    let offset = 0
    let hasMore = true

    while (hasMore) {
      try {
        // LEGO uses a GraphQL API
        // For production, you'd need to reverse-engineer or use their proper API
        // Here's a simplified version using their catalog pages
        const url = `/${this.locale}/categories/${category}?page=${Math.floor(offset / this.pageSize) + 1}`
        const $ = await this.fetchHtml(url)

        // Parse product cards
        const productCards = $('[data-test="product-leaf"], .ProductLeaf, article[data-product-id]')

        if (productCards.length === 0) {
          hasMore = false
          continue
        }

        productCards.each((_, element) => {
          const $el = $(element)

          try {
            const sku = $el.attr('data-product-id') ||
                        $el.find('[data-product-id]').attr('data-product-id') ||
                        this.extractSku($el.text())

            if (!sku) return

            const name = $el.find('[data-test="product-leaf-title"], .ProductLeafTitle, h3, h2')
              .first().text().trim()

            const priceText = $el.find('[data-test="product-leaf-price"], .ProductPrice, .Price')
              .first().text()
            const price = this.parsePrice(priceText)

            if (price === 0) return

            // LEGO usually doesn't show original prices on their site
            // but we can detect sales from badges
            const saleElement = $el.find('[data-test="sale-percentage"], .SaleBadge, .sale-tag')
            const isOnSale = saleElement.length > 0

            let originalPrice: number | undefined
            if (isOnSale) {
              const saleText = saleElement.text()
              const discountMatch = saleText.match(/(\d+)%/)
              if (discountMatch) {
                const discount = parseInt(discountMatch[1]) / 100
                originalPrice = Math.round(price / (1 - discount))
              }
            }

            // Build product URL
            const slug = $el.find('a').first().attr('href') || ''
            const productUrl = slug.startsWith('http')
              ? slug
              : `${this.config.baseUrl}${slug}`

            // Get image
            const imageUrl = $el.find('img').first().attr('src') ||
                            $el.find('img').first().attr('data-src')

            // Stock status - LEGO usually shows "Coming Soon" or "Out of Stock"
            const availabilityText = $el.find('[data-test="product-leaf-availability"], .AvailabilityStatus')
              .text().toLowerCase()
            const inStock = !availabilityText.includes('out of stock') &&
                           !availabilityText.includes('sold out') &&
                           !availabilityText.includes('coming soon') &&
                           !availabilityText.includes('אזל')

            this.addProduct({
              sku,
              name: this.cleanProductName(name),
              price,
              originalPrice,
              inStock,
              url: productUrl,
              imageUrl,
            })
          } catch (err) {
            // Skip invalid products
          }
        })

        offset += this.pageSize
        hasMore = productCards.length >= this.pageSize && offset < 500 // Safety limit

        await this.delay()
      } catch (error) {
        console.error(`Error scraping LEGO category ${category}:`, error)
        hasMore = false
      }
    }
  }
}
