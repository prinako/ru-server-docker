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
const {
  isNeedToUpdateMongoDbSer,
  isNeedToDropDatabase,
} = require("./updateMongoDB");

//=============================///
//main functions
async function dropDatabase() {
  const todosOsCar = await todosOsCardapio((duc) => duc);

  if (todosOsCar.length > 5) {
    await dropCollection(async (e) => {
      // console.log(e);
      if (e) {
        main();
        await isNeedToDropDatabase();
        // notify all users
        await novoCardapioDaSemana();
        return;
      } else {
        console.log(e);
      }
    });
  }
}

async function checkForUpdate() {
  console.log("checking for update...");
  //for today date
  const date = new Date();
  const toDayDate = `${date.getDate()}-0${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  await dropDatabase();

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
  // console.log("go");

  await getAllCardapio(async (next) => {
    await updateCardapio(next);
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

module.exports = { main, checkForUpdate, dropDatabase };
