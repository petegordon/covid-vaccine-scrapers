//const puppeteer = require('puppeteer');
const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())



if(process.argv[2]){
    zipParam = process.argv[2];
    if(zipParam.startsWith('[')){
        zipParam = JSON.parse(zipParam)
    }else{
        throw new Error("Must pass in zipcodes as JSON Array as string")
    }
} else {
    console.log(process.cwd())
    zipParam = JSON.parse(fs.readFileSync('ohio_zips.json'))
    zipParam = zipParam.slice(0,3)
}

(async () => {
    console.log('zip codes:'+zipParam)
    const browser = await puppeteer.launch({devtools: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page = await browser.newPage();
    await page.goto('https://www.kroger.com/rx/guest/get-vaccinated');
    await page.screenshot({ path: 'example.png' })


    async function getStoresByZip(zip){
        const pageTwo = await browser.newPage();
        //await pageTwo.waitForTimeout(1000)
        await pageTwo.on('response', async (response) => {  
        
            if (response.url().endsWith("address="+zip) && response.status() == 200){
                console.log(response.url())
                console.log(response.status())      
                json = await response.json()
                console.log(json)
                fs.writeFileSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/stores_search_'+zip+'.json', JSON.stringify(json, null, 2))
                pageTwo.close()                
            }
        });  
        await pageTwo.goto('https://www.kroger.com/rx/api/anonymous/stores?address='+zip);    
    }

    zipParam.forEach((zip) => getStoresByZip(zip))

})();