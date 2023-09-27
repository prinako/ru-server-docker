const express = require("express");
const router = express.Router();

const { isItNeedToNotify } = require("../lodash/verifyIsEqual");

const {
  postCardapio, // Função para adicionar um novo cardápio ao banco de dados.
  todosOsCardapio, // Função para obter todos os cardápios do banco de dados.
  dropCollection, // Função para excluir uma coleção (possivelmente no banco de dados).
  updateCardapio, // Função para atualizar informações de um cardápio no banco de dados.
  findCardapioByDate, // Função para buscar um cardápio com base em uma data específica.
} = require("../databases/querys");

const { getAllCardapio } = require("../cardapio/getCardapio");

// Importa um módulo relacionado ao envio de notificações push. 
const {
  notifyUserCardapioDeHojeMudou,
  novoCardapioDaSemana,
} = require("../firebase/push-notification");

// Importa um módulo para atualiza o servidor do mongodb.
const { isNeedToUpdateMongoDbSer } = require("./updateMongoDB");

//=============================///
//main functions
async function dropDatabase() {
  await dropCollection((e) => {
    // console.log(e);
    if (e) {
      main();
      // notify all users
      novoCardapioDaSemana();
      return res.send(e);
    } else {
      res.send(e);
    }
  });
}

async function checkForUpdate() {
  //for today date
  const date = new Date();
  const toDayDate = `${date.getDate()}-0${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  const cardapioDeHoje = await findCardapioByDate(toDayDate, (e) => e);
  //  console.log(cardapioDeHoje);

  await doUpdate(async () => {
    await isItNeedToNotify(cardapioDeHoje, toDayDate, async (next) => {
      // console.log(next.almoco.isAlmocoNeed);
      if (next.almoco.isAlmocoNeed || next.json.isJanterNeed) {
        await notifyUserCardapioDeHojeMudou({
          almoco: next.almoco,
          jantar: next.jantar,
          nome: next.nomeDaRefei,
        });
        await isNeedToUpdateMongoDbSer();
      }
    });
    //console.log(callback);
  });
}

async function doUpdate(callback) {
  console.log("go");
  // const date = new Date();
  // console.log(`${date.getDate() + 1}-0${
  //   date.getMonth() + 1
  // }-${date.getFullYear()}`);

  await getAllCardapio(async (next) => {
    await updateCardapio(next, (e) => {
      console.log(e);
    });
  });
  return callback();
}

function main() {
  getAllCardapio(async (next) => {
    postCardapio(await next, (e) => {
      // console.log("writing cardapio no database");
    });
  });
  return;
}

module.exports = { main, router, checkForUpdate, dropDatabase };
