import cron, { schedule } from 'node-cron'
import crawler from './crawler.js'

const expression = process.env.CRON_EXPRESSION || '* * * * *'

cron.schedule(expression, async () => {
  await crawler.run([
    'https://eservices.es2.immd.gov.hk/es/quota-enquiry-client',
  ])
})
