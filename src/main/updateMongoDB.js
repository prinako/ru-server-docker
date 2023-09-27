const {postCardapioSer}= require("../databases/querysSer");
const {getAllCardapio} = require("../cardapio/getCardapio");

async function isNeedToUpdateMongoDbSer(){
    await getAllCardapio(async(novoCadapio)=>{
        await postCardapioSer(novoCadapio, (next)=>{
            console.log(next);
        })
    })
    return;
  
}


module.exports = {isNeedToUpdateMongoDbSer};