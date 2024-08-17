const isItNeedToNotify = require("../lodash/verifyIsEqual");
const {
  postCardapio,
  getAllCardapioFromDB,
  dropCollection,
  findOneCardapioByDateAndupdate,
  findCardapioByDate,
} = require("../databases/querys");


const { getNewCardapioFromSite, getTodayCardapio } = require("../cardapio/getCardapio");
const {
  notifyUserCardapioDeHojeMudou,
  novoCardapioDaSemana,
} = require("../firebase/push-notification");

const { todayDate } = require("../utils/getTodayDate");
const { timestamps } = require("../utils/getTimestamps");


/**
 * Asynchronously updates the cardapio data in the database if it has changed
 * and notifies all users if the cardapio has changed.
 *
 * @return {Promise<void>} A promise that resolves when the update is complete.
 */
async function update() {
  console.debug(`> ${ timestamps()} - ${todayDate()}: Checking for updates..`);
  // Get the current date
  const toDayDate = todayDate();

  // Find the cardapio data for today in the database
  const todayCardapioFromDB = await findCardapioByDate(toDayDate, (e) => e);

  // Get the cardapio data for today from the website
  const todayCardapioFromSite = await getTodayCardapio(toDayDate, (e) => e);
  
  // If the cardapio data is not available, return
  if (todayCardapioFromSite === null || todayCardapioFromDB === null) {
    return;
  }

  // Check if the cardapio has changed and update the database
  await isItNeedToNotify(todayCardapioFromDB, todayCardapioFromSite, async (next) => {

    if (next.almoco.isAlmocoNeed || next.jantar.isJantarNeed) {
      await findOneCardapioByDateAndupdate(todayCardapioFromSite, (e) => {
      });
  
      // Notify all users that the cardapio has changed
      await notifyUserCardapioDeHojeMudou({
        almoco: next.almoco,
        jantar: next.jantar,
        nome: next.nomeDaRefei,
      });
      console.debug(`> ${timestamps()} - ${toDayDate}: Updates complete.`);
    }else{
      console.debug(`> ${timestamps()} - ${toDayDate}: No need to update.`);
    }
    // Update the cardapio data in the database
  });

  return;
}


module.exports = {update};
