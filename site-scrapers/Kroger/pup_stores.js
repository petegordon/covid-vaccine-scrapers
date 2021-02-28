const puppeteer = require('puppeteer');
const fs = require('fs')

const zip = process.argv[2];

(async () => {
    console.log('zip code:'+zip)
// /Applications/Firefox.app/Contents/MacOS/firefox
  const browser = await puppeteer.launch({devtools: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page = await browser.newPage();
  keepProcessing = true;
  tryCount = 0;
  await page.goto('https://www.kroger.com/rx/api/anonymous/stores?address='+zip);
  await page.screenshot({ path: 'example.png' });


while(keepProcessing){

    const pageTwo = await browser.newPage();
    await pageTwo.waitForTimeout(30000)

    await pageTwo.on('response', async (response) => {  
      
        if (response.url().endsWith("address="+zip) && response.status() == 200){
            console.log(response.url())
            console.log(response.status())      
            json = await response.json()
            console.log(json)
            fs.writeFileSync('/Users/petegordon/CantStopColumbus/covid-vaccine-scrapers/site-scrapers/Kroger/Stores/stores_'+zip+'.json', JSON.stringify(json))
            //await browser.close();
            keepProcessing = false;
        }
  });  

  //await page.reload();
  console.log("Try::"+tryCount++)
  await pageTwo.goto('https://www.kroger.com/rx/api/anonymous/stores?address='+zip);
}
 
})();