//const puppeteer = require('puppeteer');
const fs = require('fs')
const readline = require('readline');


const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
startTime = new Date()
zipStartTime = new Date()
storesDir = "/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/ZipSlots/"

console.log("START:"+startTime)

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

let manualProcessing = false

if(process.argv[2]){
    zipParam = process.argv[2];
    if(zipParam.startsWith('[')){
        zipParam = JSON.parse(zipParam)
    }else{
        if(zipParam=="manual"){
            manualProcessing = true
        }
        throw new Error("Must pass in zipcodes as JSON Array as string")
    }
} else {
    console.log(process.cwd())
    //zipParam = JSON.parse(fs.readFileSync('ohio_zips.json'))
    //zipParam = JSON.parse(fs.readFileSync('kroger_zipcodes.json'))
    zipParam = JSON.parse(fs.readFileSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/kroger_zipcodes.json'))
    //zipParam = zipParam.slice(0,10)
    let storesProcessed = fs.readdirSync(storesDir)
    zipProcessed = storesProcessed.map((f) => { 
        zipcode = f.split('_')[2].split('.')[0]
        time = parseInt(f.split('_')[1])
        if (time > (new Date().getTime() - (1000 * 60 * 60 * 3))){
            return zipcode
        }
    })

    zipParam = zipParam.filter((z) => !zipProcessed.includes(z))

    console.log("create vaccine location length:"+zipParam.length)
}

const EventEmitter = require('events');
class ScrapeEmitter extends EventEmitter {}

const myEmitter = new ScrapeEmitter();
myEmitter.on('processZipCodes', (page) => {
    console.log('a processZipCodes event occurred!');
    if(zipParam.length > 0){
        zipToProcess = zipParam[0]
        facilityToProcess = null
        //zipParam = zipParam.slice(1)
        if(manualProcessing){
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });        
            rl.question(`Continue with facility: ${facilityToProcess} and ${zipToProcess}? `, (fac) => { 
                myEmitter.emit("searchStores", fac, page)
            })
            rl.write(zipToProcess);
        } else {
             myEmitter.emit("searchStores", zipToProcess, page)          
        }

        
    } else {
        console.log("START:"+startTime)
        console.log("END:"+new Date())        
    }
})
myEmitter.on('searchStores', async (zip, page) => {
    zipStartTime = new Date()
  // let facilityObj = zipParam.filter((s) => {return s.facilityId == fac })
   zipParam = zipParam.slice(1)

   console.log(zip)
//    let zip = facilityObj[0].address.zipCode


    await page.on('response', async (response) => { 

        if (response.url().endsWith(zip) && response.status() == 200){
            console.log(response.url())
            console.log(response.status())      
            json = await response.json()
            //await delay(2000)            
           // myEmitter.emit('foundStores', fac.facilityId, json, page);       
            processedCount++    
            processing = false

            console.log('an searchStores event occurred!'+zip);
            await page.goto("https://www.kroger.com/rx/api/anonymous/scheduler/slots/locationsearch/pharmacy/"+zip+"/2021-03-07/2021-03-14/50?appointmentReason=122&appointmentReason=125&appointmentReason=129");
            
                    
        }

        if (!response.url().endsWith(zip) && response.url().indexOf(zip) > 0 && response.status() == 200){
            console.log(response.url())
            console.log(response.status())      
            json = await response.json()
            await delay(6000)            
            myEmitter.emit('foundStores', zip, json, page);                   
        }

        if (!response.url().endsWith(zip) && response.url().indexOf(zip) > 0  && response.status() != 200){
            console.log(response.url())
            console.log(response.status())             
            console.log("START:"+startTime)
            console.log("END:"+new Date())      
            //process.exit()
            /*
            const rl2 = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });        
            rl2.question(`Continue by starting over? `, () => { 
                myEmitter.emit('processZipCodes', page);
            })  
            */  
           await delay(60000)
           myEmitter.emit('processZipCodes', page);       
        }

    });  



    await page.goto('https://www.kroger.com/rx/guest/get-vaccinated');
    
    page.waitForSelector('.PharmacyLocator [name="findAStore"]')
    const input = await page.$('.PharmacyLocator [name="findAStore"]');
    await input.click({ clickCount: 3 })
    for(let c of zip+""){
        page.waitForTimeout(200)
        await page.type('.PharmacyLocator [name="findAStore"]', c)                
    }
    processing = true
    await delay(2000)
    page.click('.PharmacyLocator [aria-label="search"]')

    console.log('get stores for zip:'+zip) 
    await delay(4000) 
    try{
        
        let securityCheck = await page.evaluate(() => {
            let el = document.querySelector("#sec-overlay") 
            val = "none"
            if(el){
                val = window.getComputedStyle(el).getPropertyValue("display")   
            }   
            return val != "none"
        })
        console.log(securityCheck)   
        if(securityCheck){
            await delay(300000)
            page.goto('https://www.kroger.com/')
            await delay(6000)
            myEmitter.emit('processZipCodes', page);
        }
    }catch(ex){
        console.log(ex)        
        console.log('caught exception')

        await delay(5000)
        await page.goto('https://www.kroger.com/rx/guest/get-vaccinated');
        myEmitter.emit('processZipCodes', page);
    }


});
myEmitter.on('foundStores', (zip, stores, page) => {
    console.log('an foundStores event occurred! '+zip);
    fs.writeFileSync(storesDir+'slots_'+new Date().getTime()+'_'+zip+'.json', JSON.stringify(stores, null, 2))
    console.log("ZIP PROCESS START:"+zip+":"+zipStartTime)
    console.log("ZIP PROCESS END:"+zip+":"+new Date())  
    myEmitter.emit("processZipCodes", page)
});




(async () => {
    console.log('zip codes:'+JSON.stringify(zipParam))
    
    const browser = await puppeteer.launch({headless:false, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page = await browser.newPage();
    await page.goto('https://www.kroger.com/rx/guest/get-vaccinated');
    await page.screenshot({ path: 'example.png' })
    processing = false
    processedCount = 0

    myEmitter.emit('processZipCodes', page);
    
    

})();