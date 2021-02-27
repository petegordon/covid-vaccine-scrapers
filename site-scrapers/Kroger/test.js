const axios = require('axios');

async function main(){
  try{
    response = await axios.get("https://www.kroger.com/rx/api/anonymous/stores?address=43001")
    console.log(response)
  }catch(ex){
    console.log(ex)
    console.log('hello exception')
  }

  try{
    responseTwo = await axios.get("https://www.kroger.com/rx/api/anonymous/stores?address=43001")
    console.log(responseTwo)
  }catch(ex){
    console.log(ex)
    console.log('hello exception')
  }
  
}
main();

