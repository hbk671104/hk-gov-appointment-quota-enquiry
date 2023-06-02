// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, Dataset } from 'crawlee'

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
  // Use the requestHandler to process each of the crawled pages.
  async requestHandler({ request, page, log }) {
    const title = await page.title()
    log.info(`Processing '${title}'...`)

    // one big set of data
    const dataset = {}

    // wait for the title to be available
    await page.waitForSelector('#title')

    // select the option one by one
    const select = await page.locator('select')
    for (const option of await select.locator('option').all()) {
      const label = await option.textContent()
      await select.selectOption({ label })

      // wait for the appointment status to be available
      await page.waitForSelector('#appointmentStatus')
      const trs = await page.locator('tbody > tr').all()
      // remove the first row (th)
      trs.shift()

      const officeQuota = []

      for (const tr of trs) {
        let [date, quotaR, quotaK] = await tr.locator('td').all()
        date = await date.textContent()
        quotaR = await quotaR.locator('[class^="quota-"]')
        quotaK = await quotaK.locator('[class^="quota-"]')

        const quotaRClass = await quotaR.getAttribute('class')
        const quotaKClass = await quotaK.getAttribute('class')

        if (['quota-y', 'quota-g'].includes(quotaRClass)) {
          const content = await quotaR.evaluate(
            (node) => window.getComputedStyle(node, ':after').content
          )

          officeQuota.push({
            date,
            type: 'R',
            content: content.replace(/"/g, ''),
          })
        }

        if (['quota-y', 'quota-g'].includes(quotaKClass)) {
          const content = await quotaK.evaluate(
            (node) => window.getComputedStyle(node, ':after').content
          )

          officeQuota.push({
            date,
            type: 'K',
            content: content.replace(/"/g, ''),
          })
        }
      }

      dataset[label] = officeQuota
    }

    // Save results as JSON to ./storage/datasets/default
    await Dataset.pushData({ title, url: request.loadedUrl, dataset })
  },
  // Uncomment this option to see the browser window.
  // headless: false,
})

// Add first URL to the queue and start the crawl.
await crawler.run(['https://eservices.es2.immd.gov.hk/es/quota-enquiry-client'])
