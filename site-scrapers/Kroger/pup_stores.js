const puppeteer = require('puppeteer');

(async () => {
// /Applications/Firefox.app/Contents/MacOS/firefox
  const browser = await puppeteer.launch({headless:false, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page = await browser.newPage();
 // await page.goto('https://www.kroger.com/rx/api/anonymous/stores?address=43001');
  await page.screenshot({ path: 'example.png' });
  await page.on('response', async (response) => {  
      
    if (response.url().endsWith("address=43001") && response.status() == 200){
        console.log(response.url())
        console.log(response.status())      
        json = await response.json()
        console.log(json)
    }

    /*
    if (response.url().endsWith("address=43001")){
      console.log("response code: ", response.status());
      console.log(await response.json())
    }
    */
  });  
  await page.waitForTimeout(5000)
  //await page.reload();
  //await page.goto('https://www.kroger.com/rx/api/anonymous/stores?address=43001');


  
  
 // await browser.close();
})();