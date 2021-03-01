//const puppeteer = require('puppeteer');
const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

storesParam = JSON.parse(fs.readFileSync('all_facilities.json'))
vaccinesDir = "/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Vaccines/"

let storesProcessed = fs.readdirSync(vaccinesDir)
vaccineLocationProcessed = storesProcessed.map((f) => { return f.split('_')[2].split('.')[0]})
storesParam = storesParam.filter((z) => !vaccineLocationProcessed.includes(z))
console.log("create storesParam length:"+storesParam.length);


storesParam = storesParam.slice(0,10);

(async () => {
    console.log('store facility codes:'+storesParam)
    const browser = await puppeteer.launch({devtools: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page = await browser.newPage();
    await page.goto('https://www.kroger.com/rx/guest/get-vaccinated');
    await page.screenshot({ path: 'example.png' })


    async function getVaccinesByFacilityCode(facilityCode){
        const pageTwo = await browser.newPage();
        //await pageTwo.waitForTimeout(1000)
        await pageTwo.on('response', async (response) => {  
        
            if (response.url().endsWith(facilityCode) && response.status() == 200){
                console.log(response.url())
                console.log(response.status())      
                json = await response.json()
             //   console.log(json)
                fs.writeFileSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Vaccines/vaccines_facility_'+facilityCode+'.json', JSON.stringify(json, null, 2))
                pageTwo.close()                
            }
        });  
        await pageTwo.goto('https://www.kroger.com/rx/api/anonymous/scheduler/reasons/pharmacy/'+facilityCode);    
    }

    storesParam.forEach((facility) => getVaccinesByFacilityCode(facility))

})();