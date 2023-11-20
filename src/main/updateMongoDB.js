const {
  postCardapioSer,
  updateCardapioSer,
  dropCollectionSer,
} = require("../databases/querysSer");

const { getAllCardapio } = require("../cardapio/getCardapio");

/**
 * Checks if it is necessary to update the MongoDB server and performs the necessary update actions.
 *
 * @returns {Promise<void>} - A promise that resolves when the update check and actions are completed.
 */
async function isNeedToUpdateMongoDbSer() {
  let novoUpdateCar = await getAllCardapio(async (novoCadapio) => novoCadapio);

  await updateCardapioSer(novoUpdateCar);
  return;
}

/**
 * Checks if it is necessary to drop the database, and performs necessary actions accordingly.
 * @async
 * @returns {Promise<void>} - A promise that resolves when the necessary actions are completed.
 *
 * @description
 * This function checks if it is necessary to drop the database by calling the `dropCollectionSer` function. If the database needs to be dropped, it retrieves all cardapio data using the `getAllCardapio` function and saves it to the database using the `postCardapioSer` function. If the database does not need to be dropped, it logs the result to the console. The function returns a promise that resolves when the necessary actions are completed.
 */
async function isNeedToDropDatabase() {
  await dropCollectionSer(async (e) => {
    if (e) {
      let novoCar = await getAllCardapio(async (novoCadapio) => novoCadapio);

      await postCardapioSer(novoCar, (e) => e);
    } else {
      console.log(e);
    }
  });
}

module.exports = { isNeedToUpdateMongoDbSer, isNeedToDropDatabase };
