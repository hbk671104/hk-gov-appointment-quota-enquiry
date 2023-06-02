import cron from 'node-cron'
import crawler from './crawler.js'

const expression = process.env.CRON_EXPRESSION || '0 * * * *'

cron.schedule(expression, async () => {
  await crawler.run([
    'https://eservices.es2.immd.gov.hk/es/quota-enquiry-client',
  ])
})
