const fs = require('fs')

storeSet = new Set()
files = fs.readdirSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/')
files.forEach((file) => {
    stores = JSON.parse(fs.readFileSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/'+file))
    stores.forEach(store => storeSet.add(store))
})
fs.writeFileSync('all_stores.json',JSON.stringify(Array.from(storeSet)))
console.log("Finished Processing Stores into a single array.")