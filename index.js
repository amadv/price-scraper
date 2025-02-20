const scrapeIt = require('scrape-it')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Configurable settings
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db/database.sqlite')
const SCRAPE_DELAY = parseInt(process.env.SCRAPE_DELAY, 10) || 2000
const URL_TEMPLATE = process.env.URL_TEMPLATE || 'https://amazon.com/dp/{asin}'

const db = new sqlite3.Database(DB_PATH)

const wait = (time) => new Promise(resolve => setTimeout(resolve, time))

// Scrape a given product by ASIN using the URL template
const scrapeProduct = async (asin) => {
  const url = URL_TEMPLATE.replace('{asin}', asin)
  console.log('Scraping URL:', url)

  try {
    const { data, response } = await scrapeIt(url, {
      price: {
        selector: '#price_inside_buybox',
        convert: p => {
          if (!p) return null
          const match = p.match(/\$?([\d,]+\.?\d*)/)
          return match ? Math.round(parseFloat(match[1]) * 100) : null
        }
      }
    })

    if (response.statusCode !== 200) throw new Error(`HTTP ${response.statusCode}`)

    return data.price || null
  } catch (err) {
    console.error(`Failed to scrape ${asin}:`, err.message)
    return null
  }
}

// Update price in the database
const updatePrice = async (asin, price) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE items SET price = ? WHERE asin = ?', [price, asin], (err) => {
      if (err) {
        console.error(`Error updating price for ${asin}:`, err.message)
        reject(err)
      } else {
        console.log(`Updated price for ${asin}: ${price}`)
        resolve()
      }
    })
  })
}

// Main scraping loop
const scrape = async () => {
  try {
    const items = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

    for (const item of items) {
      const price = await scrapeProduct(item.asin)
      if (price !== null) {
        await updatePrice(item.asin, price)
      } else {
        console.log(`ASIN ${item.asin} is out of stock or unavailable.`)
      }
      await wait(SCRAPE_DELAY)
    }
  } catch (err) {
    console.error('Error in scraping process:', err.message)
  } finally {
    db.close()
  }
}

scrape()

