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
  await getAllCardapio(async (novoCadapio) => {
    await updateCardapioSer(novoCadapio);
  });
  return;
}

/**
 * Checks if it is necessary to drop the database collection and performs the necessary actions accordingly.
 *
 * @returns {Promise<void>} - A promise that resolves when the check and actions are completed.
 */
async function isNeedToDropDatabase() {
  await dropCollectionSer(async (e) => {
    if (e) {
      await getAllCardapio(async (novoCadapio) => {
        await postCardapioSer(novoCadapio, (e) => e);
      });
    } else {
      console.log(e);
    }
  });
}

module.exports = { isNeedToUpdateMongoDbSer, isNeedToDropDatabase };
