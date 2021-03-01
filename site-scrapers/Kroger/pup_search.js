//const puppeteer = require('puppeteer');
const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
startTime = new Date()
console.log("START:"+startTime)

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
    const browser = await puppeteer.launch({headless:false, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page = await browser.newPage();
    await page.goto('https://www.kroger.com/rx/guest/get-vaccinated');
    await page.screenshot({ path: 'example.png' })
    processing = false
    processedCount = 0
    //await page.waitForTimeout(5000)

    function getStoresByZip(zip){

        page.waitForTimeout(1000)
        const input = await page.$('.PharmacyLocator [name="findAStore"]');
        await input.click({ clickCount: 3 })
        for(let c of zip+""){
            page.waitForTimeout(200)
            await page.type('.PharmacyLocator [name="findAStore"]', c)                
        }
        /*
        zip.toString().forEach((c) => {
            page.type('.PharmacyLocator [name="findAStore"]', c)    
            page.waitForTimeout(300)
        })
        */
        //page.type('.PharmacyLocator [name="findAStore"]', zip)

//        const pageTwo = await browser.newPage();
        //await pageTwo.waitForTimeout(1000)
        await page.on('response', async (response) => {  

            if (response.url().endsWith("address="+zip)){
                console.log(response.url())
                console.log(response.status())      
                json = await response.json()
                fs.writeFileSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/stores_search_'+zip+'.json', JSON.stringify(json, null, 2))
//                pageTwo.close()        
                processedCount++    
                if(processedCount == zipParam.length){
                    console.log("START:"+startTime)
                    console.log("END:"+new Date())
                }
                processing = false

            }
        });  
        page.waitForTimeout(1000)
        processing = true
        page.click('.PharmacyLocator [aria-label="search"]')
        page.waitForTimeout(1000)
        console.log('get stores for zip:'+zip)     
    

        //await page.goto('https://www.kroger.com/rx/api/anonymous/stores?address='+zip);    
    }

    for(i=0;i<zipParam.length;i++){          
        await getStoresByZip(zipParam[i])                 
/*        
        while(processing){
            if(new Date().getTime() % 1000 == 0)
                process.stdout.write(".")
        }
*/        
    }
    

})();