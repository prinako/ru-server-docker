const {postCardapioSer, updateCardapioSer, dropCollectionSer}= require("../databases/querysSer");
const {getAllCardapio} = require("../cardapio/getCardapio");

async function isNeedToUpdateMongoDbSer(){
    await getAllCardapio(async(novoCadapio)=>{
        await updateCardapioSer(novoCadapio);
    })
    return;
}


async function isNeedToDropDatabase(){
    await dropCollectionSer(async(e)=>{
        if(e){
            await getAllCardapio(async(novoCadapio)=>{
                await postCardapioSer(novoCadapio,(next)=>{

                });
            })
        }else{
            console.log(e);
        }
    })
}

module.exports = {isNeedToUpdateMongoDbSer, isNeedToDropDatabase};