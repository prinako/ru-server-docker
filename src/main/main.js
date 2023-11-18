const { isItNeedToNotify } = require("../lodash/verifyIsEqual");

const {
  postCardapio, // Função para adicionar um novo cardápio ao banco de dados.
  todosOsCardapio, // Função para obter todos os cardápios do banco de dados.
  dropCollection, // Função para excluir uma coleção (possivelmente no banco de dados).
  updateCardapio, // Função para atualizar informações de um cardápio no banco de dados.
  findCardapioByDate, // Função para buscar um cardápio com base em uma data específica.
} = require("../databases/querys");

const { getAllCardapio } = require("../cardapio/getCardapio");

const {getTodayDate} = require("../todayDate/getTodayDate");

// Importa um módulo relacionado ao envio de notificações push.
const {
  notifyUserCardapioDeHojeMudou,
  novoCardapioDaSemana,
  cardapioDoDia,
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
 * Check for updates in the database and perform necessary actions based on the current state.
 *
 * @returns {Promise<void>} A promise that resolves when the update check is completed.
 *
 * @description
 * This function checks for updates in the database by retrieving all menu items using the `todosOsCardapio` function. If the number of menu items is greater than 6, it drops the database using the `dropDatabase` function. If the database is dropped successfully, it calls the `main` function and performs additional actions using the `isNeedToDropDatabase` function. If the number of menu items is not greater than 6, it retrieves the current date using the `getTodayDate` function and finds the menu for the current date using the `findCardapioByDate` function. It then performs an update using the `doUpdate` function. If the retrieved menu is not null, it checks if a notification needs to be sent using the `isItNeedToNotify` function. If a notification is required, it sends a notification to the user using the `notifyUserCardapioDeHojeMudou` function and performs additional actions using the `isNeedToUpdateMongoDbSer` function. The function returns a promise that resolves when the update check is completed.
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
        }
      });
    } else {
      
      const toDayDate = await getTodayDate((date)=>date);
      console.log(toDayDate)
      const cardapioDeHoje = await findCardapioByDate(toDayDate, (e) => e);
       console.log(cardapioDeHoje);

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
 * Notify the user about the menu for a specific meal.
 *
 * @param {string} de - The meal type to notify the user about ('almoço' or 'jantar').
 * @returns {Promise<void>} A promise that resolves once the user is notified.
 *
 * @description
 * This function retrieves the current date using the `getTodayDate` function and finds the menu for the current date using the `findCardapioByDate` function. Depending on the value of the `de` parameter, it constructs a notification object for either lunch or dinner. The user is then notified about the menu for the specified meal type.
 */
async function notifyUserCardapioDoDia(de) {
  const toDayDate = await getTodayDate((date) => date);

  const cardapioDeHoje = await findCardapioByDate(toDayDate, (e) => e);
  
  let almoco, jantar;

  if (de === 'almoco') {
    almoco = {
      isAlmoco: true,
      refei: cardapioDeHoje.amoco.nomeDaRefei,
    };
  } else {
    almoco = {
      isAlmoco: false,
    };
  }

  if (de === 'jantar') {
    jantar = {
      isJanter: true,
      refei: cardapioDeHoje.jantar.nomeDaRefei,
    };
  } else {
    jantar = {
      isJanter: false,
    };
  }
  await cardapioDoDia({almoco,jantar});
}



/**
 * Perform the main function to retrieve all menu items, post them, and perform necessary actions.
 *
 * @returns {Promise<void>} A promise that resolves when the main function is completed.
 *
 * @description
 * This function is the main entry point that retrieves all menu items using the `getAllCardapio` function. It then posts each menu item using the `postCardapio` function. If the result of posting a menu item is equal to 5, the `novoCardapioDaSemana` function is called. The function returns a promise that resolves when the main function is completed.
 */
async function main() {
  await getAllCardapio(async (doc) => {
    if (doc) {
      await postCardapio(doc, async (e) => {
        if(e === 5){
          await novoCardapioDaSemana()
        }
        // console.log(e)
      });
    }
  });
  return;
}

module.exports = { main, checkForUpdate, dropDatabase, notifyUserCardapioDoDia };
