import { chromium } from 'playwright'

const b = await chromium.launch({ headless: true })
const p = await b.newPage()
await p.goto('https://www.thecoatingstore.com/color-type/candy/', { waitUntil: 'domcontentloaded', timeout: 30000 })
await p.waitForTimeout(4000)
console.log('Title:', await p.title())
const count1 = await p.evaluate(() => document.querySelectorAll('li.product').length)
const count2 = await p.evaluate(() => document.querySelectorAll('.product-grid-item').length)
const count3 = await p.evaluate(() => document.querySelectorAll('.products li').length)
const count4 = await p.evaluate(() => document.querySelectorAll('article.product').length)
const count5 = await p.evaluate(() => document.querySelectorAll('[data-product_id]').length)
console.log('li.product:', count1, 'product-grid-item:', count2, '.products li:', count3, 'article.product:', count4, '[data-product_id]:', count5)

// Find what elements contain product titles
const info = await p.evaluate(() => {
  const titles = document.querySelectorAll('h2, h3, .woocommerce-loop-product__title')
  const firstFive = []
  titles.forEach((el, i) => {
    if (i < 5) firstFive.push({ tag: el.tagName, class: el.className, text: el.textContent.trim().substring(0, 60) })
  })
  return firstFive
})
console.log('Title elements:', JSON.stringify(info, null, 2))

// Inspect product elements more carefully
const productInfo = await p.evaluate(() => {
  const items = []
  document.querySelectorAll('li.product').forEach((el, i) => {
    if (i >= 3) return
    const titleEl = el.querySelector('.woopack-product-title, .woocommerce-loop-product__title, h2, h3')
    const imgEl = el.querySelector('img')
    items.push({
      titleClass: titleEl ? titleEl.className : 'NONE',
      title: titleEl ? titleEl.textContent.trim().substring(0, 60) : 'NONE',
      imgSrc: imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || 'NONE').substring(0, 100) : 'NONE',
      imgDataSrc: imgEl ? imgEl.getAttribute('data-src') || 'no-data-src' : 'no-img'
    })
  })
  return items
})
console.log('Product info:', JSON.stringify(productInfo, null, 2))

const nextHref = await p.evaluate(() => {
  const el = document.querySelector('a.page-numbers[class*="next"], .page-numbers a.next')
  const el2 = document.querySelector('a.page-numbers:not(.current)')
  return { next: el ? el.href : 'none', second: el2 ? el2.href : 'none' }
})
console.log('Next page href:', JSON.stringify(nextHref))

await b.close()
