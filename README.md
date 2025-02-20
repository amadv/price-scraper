# Universal Price Scraper

A flexible price scraper written in Node.js using `scrape-it` and `sqlite3`.  
This script can scrape product prices from Amazon (or other websites) and update a local SQLite database.

## Setup

### Initialize the Database
Before running the scraper, set up the database with some dummy items:

```sh
cd db
sqlite3 database.sqlite < schema.sql
sqlite3 database.sqlite < seed.sql
cd ..
```

## Install
```
npm i
```
## Configuration
You can customize the scraper behavior using environment variables. Create a .env file in the project root and define the following variables:

```
# Path to the SQLite database file
DB_PATH=./db/database.sqlite

# Delay (in milliseconds) between scrapes to avoid getting blocked
SCRAPE_DELAY=2000

# URL template (default: Amazon)
# Use {asin} as a placeholder for the product ID
URL_TEMPLATE=https://amazon.com/dp/{asin}
```

## Run the scraper
To start scraper
`npm start`

It will:

Fetch all product ASINs from the database.
Scrape prices based on the URL_TEMPLATE.
Update the database with the latest prices.
Handle errors and delays automatically.


## Modifying for Other Websites
To scrape prices from another website, update the URL_TEMPLATE in the .env file.
For example, if scraping from eBay:
`URL_TEMPLATE=https://www.ebay.com/itm/{asin}`

Ensure the scraper logic correctly extracts price data for the new site by modifying the selector in index.js.

## Notes
- The script avoids hardcoded URLs, making it easy to adapt.
- A delay is included to prevent excessive requests.
- Error handling ensures the script doesn't crash on failures.

Happy Scraping!
