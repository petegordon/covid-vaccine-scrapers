//const puppeteer = require('puppeteer');
const fs = require('fs')
const readline = require('readline');


const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
startTime = new Date()
zipStartTime = new Date()
storesDir = "/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/"

console.log("START:"+startTime)

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

if(process.argv[2]){
    zipParam = process.argv[2];
    if(zipParam.startsWith('[')){
        zipParam = JSON.parse(zipParam)
    }else{
        throw new Error("Must pass in zipcodes as JSON Array as string")
    }
} else {
    console.log(process.cwd())
    //zipParam = JSON.parse(fs.readFileSync('ohio_zips.json'))
    zipParam = JSON.parse(fs.readFileSync('kroger_zipcodes.json'))
    //zipParam = zipParam.slice(0,10)
    let storesProcessed = fs.readdirSync(storesDir)
    zipProcessed = storesProcessed.map((f) => { return f.split('_')[2].split('.')[0]})
    zipParam = zipParam.filter((z) => !zipProcessed.includes(z))
    console.log("create zipParam length:"+zipParam.length)
}

const EventEmitter = require('events');
class ScrapeEmitter extends EventEmitter {}

const myEmitter = new ScrapeEmitter();
myEmitter.on('processZipCodes', (page) => {
    console.log('a processZipCodes event occurred!');
    if(zipParam.length > 0){
        zipToProcess = zipParam[0]
        zipParam = zipParam.slice(1)
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });        
        rl.question(`Continue with zip: ${zipToProcess}? `, (zip) => { 
            myEmitter.emit("searchStores", zip, page)
        })
        rl.write(zipToProcess);
        
    } else {
        console.log("START:"+startTime)
        console.log("END:"+new Date())        
    }
})
myEmitter.on('searchStores', async (zip, page) => {
    zipStartTime = new Date()

    await page.on('response', async (response) => { 

        if (response.url().endsWith("address="+zip)){
            console.log(response.url())
            console.log(response.status())      
            json = await response.json()
            //await delay(2000)
            myEmitter.emit('foundStores', zip, json, page);       
            processedCount++    
            processing = false
            

        }
    });  

    console.log('an searchStores event occurred!'+zip);

    page.waitForSelector('.PharmacyLocator [name="findAStore"]')
    const input = await page.$('.PharmacyLocator [name="findAStore"]');
    await input.click({ clickCount: 3 })
    for(let c of zip+""){
        page.waitForTimeout(200)
        await page.type('.PharmacyLocator [name="findAStore"]', c)                
    }
    processing = true
    page.click('.PharmacyLocator [aria-label="search"]')
    console.log('get stores for zip:'+zip)     

});
myEmitter.on('foundStores', (zip, stores, page) => {
    console.log('an foundStores event occurred! '+zip);
    fs.writeFileSync(storesDir+'stores_search_'+zip+'.json', JSON.stringify(stores, null, 2))
    console.log("ZIP PROCESS START:"+zip+":"+zipStartTime)
    console.log("ZIP PROCESS END:"+zip+":"+new Date())  
    myEmitter.emit("processZipCodes", page)
});




(async () => {
    console.log('zip codes:'+zipParam)
    const browser = await puppeteer.launch({headless:false, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page = await browser.newPage();
    await page.goto('https://www.kroger.com/rx/guest/get-vaccinated');
    await page.screenshot({ path: 'example.png' })
    processing = false
    processedCount = 0

    myEmitter.emit('processZipCodes', page);
    
    

})();