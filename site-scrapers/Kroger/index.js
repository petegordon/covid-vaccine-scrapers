const https = require("https");
const fs = require("fs")

console.log(process.cwd())
zipcodes = JSON.parse(fs.readFileSync('site-scrapers/Kroger/ohio_zips.json'))
facilityLocations = new Set()

async function main(){
    zipcodes = zipcodes.slice(0,2)
    for(i=0; i<zipcodes.length; i++){
        facilities = await getKrogerStores(zipcodes[i])
    
        facilities.forEach((facility) => {
            facilityLocations.add(facility)
        })
    }
    console.log('End Processing')    
}

async function getKrogerStores(zip){
    url = "https://www.kroger.com/rx/api/anonymous/stores?address="+zip;   
    console.log(url) 
    stores = await httpRequest(url)
    return stores
}

function httpRequest(url){
    return new Promise(function(resolve, reject) {
        https.get(url, res => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }            
            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("end", () => {
                body = JSON.parse(body);
                console.log(body);
                return resolve(body)
            });
        });
    })
}

main()
