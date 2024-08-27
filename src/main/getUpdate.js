const isItNeedToNotify = require("../lodash/verifyIsEqual");
const {
  findOneCardapioByDateAndupdate,
  findCardapioByDate,
} = require("../databases/querys");


const {  getTodayCardapio } = require("../cardapio/getCardapio");
const {notifyUserCardapioDeHojeMudou} = require("../firebase/push-notification");

const { newCardapioOftheWeek } = require("./insertNewCardapioOfTheWeek");

const { todayDate } = require("../utils/getTodayDate");
const { timestamps } = require("../utils/getTimestamps");


/**
 * Asynchronously updates the cardapio data in the database if it has changed
 * and notifies all users if the cardapio has changed.
 *
 * @return {Promise<void>} A promise that resolves when the update is complete.
 */
async function update(next) {
  console.debug(`> ${ timestamps()} - ${todayDate()}: Checking for updates..`);
  // Get the current date
  const toDayDate = todayDate();

  // Find the cardapio data for today in the database
  const todayCardapioFromDB = await findCardapioByDate(toDayDate, (e) => e);

  // Get the cardapio data for today from the website
  const todayCardapioFromSite = await getTodayCardapio(toDayDate, (e) => e);
  
  // If the cardapio data is not available, return
  if (todayCardapioFromSite === null || todayCardapioFromDB === null) {
    console.debug(`> ${timestamps()} - ${toDayDate}: Cardapio  not available. Skipping update.`);
    await newCardapioOftheWeek((next) => next);
    return;
  }

  // Check if the cardapio has changed and update the database
  await isItNeedToNotify(todayCardapioFromDB, todayCardapioFromSite, async (next) => {

    // console.debug(next);

    // Check if the cardapio has changed
    if (!next.almoco.isAlmocoNeed && !next.jantar.isJantarNeed) {
      console.debug(`> ${timestamps()} - ${toDayDate}: No need to update.`);
      return;
    }

    // Update the cardapio data in the database
    await findOneCardapioByDateAndupdate(todayCardapioFromSite, (e) => {
    });

    // Notify all users that the cardapio has changed
    await notifyUserCardapioDeHojeMudou({
      almoco: next.almoco,
      jantar: next.jantar,
      nome: next.nomeDaRefei,
    });
    console.debug(`> ${timestamps()} - ${toDayDate}: Updates complete.`);
    return next('cardapio');
    // Update the cardapio data in the database
  });

  return;
}


module.exports = {update};
