/**
 * Email Service
 *
 * Handles sending email notifications for price alerts
 * Uses Supabase Edge Functions or external service (SendGrid, Resend, etc.)
 */

import type { PriceAlert, ProductWithPrices, User } from '@/types'
import { formatPrice } from '@/lib/utils'
import { stores, categoryNames } from '@/types'

// Email configuration
const config = {
  // For production, use environment variables
  apiKey: process.env.EMAIL_API_KEY || '',
  fromEmail: 'alerts@lego-israel.co.il',
  fromName: 'לגו ישראל - התרעות',
  siteUrl: process.env.SITE_URL || 'https://lego-israel.co.il',
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email notification for a triggered alert
 */
export async function sendPriceAlertEmail(
  user: User,
  alert: PriceAlert,
  product: ProductWithPrices
): Promise<boolean> {
  const lowestPrice = product.lowestPrice
  if (!lowestPrice) return false

  const store = stores[lowestPrice.storeId]
  const savings = product.savingsFromOfficial || 0
  const discount = lowestPrice.discountPercentage || 0

  const subject = `🎉 המחיר ירד! ${product.nameHe} - ${formatPrice(lowestPrice.price)}`

  const html = generatePriceAlertHtml({
    userName: user.name || 'לקוח יקר',
    productName: product.nameHe,
    productSku: product.sku,
    productImage: product.imageUrl,
    currentPrice: lowestPrice.price,
    originalPrice: lowestPrice.originalPrice,
    storeName: store?.nameHe || lowestPrice.storeId,
    storeUrl: lowestPrice.url,
    discount,
    savings,
    targetPrice: alert.targetPrice,
    productUrl: `${config.siteUrl}/product/${product.sku}`,
    unsubscribeUrl: `${config.siteUrl}/alerts?unsubscribe=${alert.id}`,
  })

  const text = generatePriceAlertText({
    productName: product.nameHe,
    productSku: product.sku,
    currentPrice: lowestPrice.price,
    storeName: store?.nameHe || lowestPrice.storeId,
    storeUrl: lowestPrice.url,
  })

  return sendEmail({
    to: user.email,
    subject,
    html,
    text,
  })
}

/**
 * Send email for category-wide sale
 */
export async function sendCategorySaleEmail(
  user: User,
  alert: PriceAlert,
  products: ProductWithPrices[]
): Promise<boolean> {
  if (!alert.category || products.length === 0) return false

  const categoryName = categoryNames[alert.category]
  const subject = `🔥 מבצעים חדשים בקטגוריית ${categoryName}!`

  const html = generateCategorySaleHtml({
    userName: user.name || 'לקוח יקר',
    categoryName,
    products: products.slice(0, 5), // Limit to top 5
    categoryUrl: `${config.siteUrl}/category/${alert.category}`,
    unsubscribeUrl: `${config.siteUrl}/alerts?unsubscribe=${alert.id}`,
  })

  return sendEmail({
    to: user.email,
    subject,
    html,
  })
}

/**
 * Send email (implementation depends on your email provider)
 */
async function sendEmail(data: EmailData): Promise<boolean> {
  // For development/testing, just log
  if (!config.apiKey) {
    console.log('📧 Email would be sent:')
    console.log(`   To: ${data.to}`)
    console.log(`   Subject: ${data.subject}`)
    return true
  }

  try {
    // Example with SendGrid
    // Replace with your preferred email service
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: data.to }] }],
        from: { email: config.fromEmail, name: config.fromName },
        subject: data.subject,
        content: [
          { type: 'text/html', value: data.html },
          ...(data.text ? [{ type: 'text/plain', value: data.text }] : []),
        ],
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

/**
 * Generate HTML for price alert email
 */
function generatePriceAlertHtml(data: {
  userName: string
  productName: string
  productSku: string
  productImage: string
  currentPrice: number
  originalPrice?: number
  storeName: string
  storeUrl: string
  discount: number
  savings: number
  targetPrice?: number
  productUrl: string
  unsubscribeUrl: string
}): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FFCD00 0%, #F57D20 100%); padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #000;">🧱 לגו ישראל</h1>
      <p style="margin: 10px 0 0 0; color: #333;">התרעת מחיר</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 18px; margin-bottom: 20px;">שלום ${data.userName},</p>

      <div style="background: #f0fff4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px;">🎉</span>
        <p style="font-size: 18px; font-weight: bold; color: #22c55e; margin: 10px 0;">המחיר ירד!</p>
      </div>

      <!-- Product Card -->
      <div style="border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
        <div style="background: #f9fafb; padding: 20px; text-align: center;">
          <img src="${data.productImage}" alt="${data.productName}" style="max-width: 200px; height: auto;">
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 12px; color: #6b7280; margin: 0 0 5px 0;">#${data.productSku}</p>
          <h2 style="margin: 0 0 15px 0; font-size: 20px;">${data.productName}</h2>

          <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 32px; font-weight: bold; color: #E3000B;">${formatPrice(data.currentPrice)}</span>
            ${data.originalPrice ? `<span style="font-size: 16px; color: #9ca3af; text-decoration: line-through;">${formatPrice(data.originalPrice)}</span>` : ''}
          </div>

          ${data.discount > 0 ? `<span style="display: inline-block; background: #E3000B; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">${data.discount}% הנחה</span>` : ''}

          ${data.savings > 0 ? `<p style="color: #22c55e; margin: 15px 0 0 0;">💰 חסכון של ₪${data.savings} מהחנות הרשמית!</p>` : ''}

          <p style="color: #6b7280; margin: 10px 0 0 0;">📍 ב-${data.storeName}</p>
        </div>
      </div>

      <!-- CTA Button -->
      <a href="${data.storeUrl}" style="display: block; background: #FFCD00; color: #000; text-align: center; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
        קנה עכשיו →
      </a>

      <p style="text-align: center; margin-top: 15px;">
        <a href="${data.productUrl}" style="color: #006DB7; text-decoration: none;">צפה בכל המחירים</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
        קיבלת מייל זה כי הגדרת התרעת מחיר באתר לגו ישראל.
      </p>
      <a href="${data.unsubscribeUrl}" style="color: #9ca3af; font-size: 12px;">בטל רישום להתרעות</a>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version
 */
function generatePriceAlertText(data: {
  productName: string
  productSku: string
  currentPrice: number
  storeName: string
  storeUrl: string
}): string {
  return `
המחיר ירד!

${data.productName} (#${data.productSku})
מחיר חדש: ${formatPrice(data.currentPrice)}
ב-${data.storeName}

לרכישה: ${data.storeUrl}

---
לגו ישראל - השוואת מחירים
  `.trim()
}

/**
 * Generate HTML for category sale email
 */
function generateCategorySaleHtml(data: {
  userName: string
  categoryName: string
  products: ProductWithPrices[]
  categoryUrl: string
  unsubscribeUrl: string
}): string {
  const productCards = data.products.map(product => `
    <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
      <div style="display: flex; gap: 15px;">
        <img src="${product.imageUrl}" alt="${product.nameHe}" style="width: 80px; height: 80px; object-fit: contain;">
        <div>
          <p style="margin: 0 0 5px 0; font-weight: bold;">${product.nameHe}</p>
          <p style="margin: 0; color: #E3000B; font-size: 18px; font-weight: bold;">${formatPrice(product.lowestPrice?.price || 0)}</p>
          ${product.lowestPrice?.discountPercentage ? `<span style="background: #E3000B; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${product.lowestPrice.discountPercentage}% הנחה</span>` : ''}
        </div>
      </div>
    </div>
  `).join('')

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
    <div style="background: #E3000B; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; color: white;">🔥 מבצעים חדשים!</h1>
      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">קטגוריית ${data.categoryName}</p>
    </div>

    <div style="padding: 30px;">
      <p>שלום ${data.userName},</p>
      <p>יש מבצעים חדשים בקטגוריה שאתה עוקב אחריה:</p>

      ${productCards}

      <a href="${data.categoryUrl}" style="display: block; background: #FFCD00; color: #000; text-align: center; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
        צפה בכל המבצעים
      </a>
    </div>

    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
      <a href="${data.unsubscribeUrl}" style="color: #9ca3af; font-size: 12px;">בטל רישום</a>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export { config as emailConfig }
