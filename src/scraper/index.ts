/**
 * LEGO Price Scraper - Main Entry Point
 *
 * This module orchestrates scraping from multiple Israeli stores
 * Run with: npm run scrape
 */

import { KspScraper } from './stores/ksp'
import { BugScraper } from './stores/bug'
import { IvoryScraper } from './stores/ivory'
import { LegoOfficialScraper } from './stores/lego-official'
import { ToysRUsScraper } from './stores/toysrus'
import { BaseScraper } from './base-scraper'
import type { ScrapedProduct, StoreName, ScrapeStatus } from '../types'

// Configuration
const config = {
  // Delay between requests (ms) - be respectful to servers
  requestDelay: 2000,
  // Maximum concurrent scrapers
  maxConcurrent: 2,
  // Timeout for each scraper (ms)
  timeout: 5 * 60 * 1000, // 5 minutes
}

// Initialize all scrapers
const scrapers: Record<StoreName, BaseScraper | null> = {
  'lego-official': new LegoOfficialScraper(),
  'ksp': new KspScraper(),
  'bug': new BugScraper(),
  'ivory': new IvoryScraper(),
  'toys-r-us': new ToysRUsScraper(),
  'amazon': null, // Requires special handling (API)
  'aliexpress': null, // Requires special handling
  'mega': null, // TODO: Implement
  'rami-levy': null, // TODO: Implement
  'other': null,
}

/**
 * Run all scrapers and collect results
 */
async function runAllScrapers(): Promise<{
  products: ScrapedProduct[]
  statuses: ScrapeStatus[]
}> {
  console.log('🚀 Starting LEGO price scraping...\n')

  const allProducts: ScrapedProduct[] = []
  const statuses: ScrapeStatus[] = []

  const activeScrapers = Object.entries(scrapers)
    .filter(([, scraper]) => scraper !== null) as [StoreName, BaseScraper][]

  console.log(`📦 Active scrapers: ${activeScrapers.length}`)
  console.log(`   ${activeScrapers.map(([name]) => name).join(', ')}\n`)

  // Run scrapers in batches
  for (let i = 0; i < activeScrapers.length; i += config.maxConcurrent) {
    const batch = activeScrapers.slice(i, i + config.maxConcurrent)

    const batchResults = await Promise.allSettled(
      batch.map(async ([storeName, scraper]) => {
        console.log(`\n🔄 Scraping ${storeName}...`)
        const startTime = Date.now()

        try {
          const products = await scraper.scrape()
          const duration = ((Date.now() - startTime) / 1000).toFixed(1)

          console.log(`✅ ${storeName}: ${products.length} products scraped in ${duration}s`)

          return {
            storeName,
            products,
            status: {
              store: storeName,
              lastRun: new Date(),
              productsScraped: products.length,
              errors: 0,
              status: 'success' as const,
            },
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`❌ ${storeName}: ${errorMessage}`)

          return {
            storeName,
            products: [],
            status: {
              store: storeName,
              lastRun: new Date(),
              productsScraped: 0,
              errors: 1,
              status: 'failed' as const,
            },
          }
        }
      })
    )

    // Collect results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        allProducts.push(...result.value.products)
        statuses.push(result.value.status)
      }
    }

    // Delay between batches
    if (i + config.maxConcurrent < activeScrapers.length) {
      console.log(`\n⏳ Waiting ${config.requestDelay}ms before next batch...`)
      await new Promise(resolve => setTimeout(resolve, config.requestDelay))
    }
  }

  return { products: allProducts, statuses }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(50))
  console.log('  LEGO Israel Price Scraper')
  console.log('  ' + new Date().toLocaleString('he-IL'))
  console.log('='.repeat(50))

  const { products, statuses } = await runAllScrapers()

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('  SCRAPING SUMMARY')
  console.log('='.repeat(50))

  const successful = statuses.filter(s => s.status === 'success').length
  const failed = statuses.filter(s => s.status === 'failed').length
  const totalProducts = products.length

  console.log(`\n📊 Results:`)
  console.log(`   Total products: ${totalProducts}`)
  console.log(`   Successful scrapers: ${successful}`)
  console.log(`   Failed scrapers: ${failed}`)

  // Per-store breakdown
  console.log(`\n📋 Per-store breakdown:`)
  for (const status of statuses) {
    const icon = status.status === 'success' ? '✅' : '❌'
    console.log(`   ${icon} ${status.store}: ${status.productsScraped} products`)
  }

  // Save results (in production, this would save to database)
  console.log('\n💾 Saving results...')
  // await saveToDatabase(products)

  console.log('\n✨ Scraping complete!\n')

  return { products, statuses }
}

// Export for use as module
export { runAllScrapers, main, config }

// Run if called directly
main().catch(console.error)
