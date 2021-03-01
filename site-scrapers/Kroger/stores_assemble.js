const fs = require('fs')

storeSet = new Set()
facilitySet = new Set()
files = fs.readdirSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/')
files.forEach((file) => {
    stores = JSON.parse(fs.readFileSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/'+file))
    try{
        stores.forEach(store => store.distance = null)
        stores.forEach(store => storeSet.add(store))
        stores.forEach(store => facilitySet.add(store.facilityId))
    } catch(ex){
        console.log(ex)
        console.log(stores)
        console.log(file)
    }
    
})
fs.writeFileSync('all_stores.json',JSON.stringify(Array.from(storeSet)))
fs.writeFileSync('all_facilities.json',JSON.stringify(Array.from(facilitySet)))
console.log("Finished Processing Stores into a single array.")