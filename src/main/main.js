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
/**
 * Drops the database collection using the provided callback function.
 *
 * @param {Function} calk - The callback function used to drop the collection.
 * @returns {Promise<void>} - A promise that resolves when the collection is dropped successfully.
 */
async function dropDatabase(calk) {
  // const todosOsCar = await todosOsCardapio((duc) => duc);
  await dropCollection(async (e) => {
    return calk(e);
  });
}

/**
 * Checks for updates in the database and performs necessary actions based on the current state.
 *
 * @returns {Promise<void>} - A promise that resolves when the update check is completed.
 */
async function checkForUpdate() {
  //for today date
  // const todosOsCar =
  await todosOsCardapio(async (duc) => {
    console.log(duc.length);

    if (duc.length > 6) {
      console.log("----------------------------------");
      console.log("---- need to drop database -------");
      console.log("----------------------------------");

      await dropDatabase(async (e) => {
        if (e) {
          main();
          await isNeedToDropDatabase();
          await novoCardapioDaSemana();
        }
      });
    } else {
      const date = new Date();

      let toDayDate;

      if (date.getMonth() > 9) {
        toDayDate = `${date.getDate()}-${
          date.getMonth() + 1
        }-${date.getFullYear()}`;
      } else {
        toDayDate = `${date.getDate()}-0${
          date.getMonth() + 1
        }-${date.getFullYear()}`;
      }

      const cardapioDeHoje = await findCardapioByDate(toDayDate, (e) => e);
      //  console.log(cardapioDeHoje);

      await doUpdate(async () => {
        console.log("checking for update...");

        if (cardapioDeHoje !== null) {
          await isItNeedToNotify(cardapioDeHoje, toDayDate, async (next) => {
            // console.log(next.almoco.isAlmocoNeed);
            console.log(next);
            if (next.almoco.isAlmocoNeed || next.json.isJanterNeed) {
              await notifyUserCardapioDeHojeMudou({
                almoco: next.almoco,
                jantar: next.jantar,
                nome: next.nomeDaRefei,
              });
              await isNeedToUpdateMongoDbSer();
            }
          });
        }
        //console.log(callback);
      });
    }
  });
}

/**
 * Performs a database update by retrieving all menu items, updating them, and executing the provided callback function.
 *
 * @param {Function} callback - The callback function to be executed after the update is completed.
 * @returns {Promise<any>} - A promise that resolves with the result of the callback function.
 */
async function doUpdate(callback) {
  // let novoCardapio = [];
  await getAllCardapio(async (next) => {
    if (next) {
      // novoCardapio = next;
      await updateCardapio(next);
    }
  });
  return callback();
}

/**
 * Executes the main function to retrieve all menu items, post them, and perform necessary actions.
 *
 * @returns {Promise<void>} - A promise that resolves when the main function is completed.
 */
async function main() {
  await getAllCardapio(async (doc) => {
    if (doc) {
      postCardapio(await doc, (e) => {
        // console.log(e)
      });
    }
  });
  return;
}

module.exports = { main, checkForUpdate, dropDatabase };
