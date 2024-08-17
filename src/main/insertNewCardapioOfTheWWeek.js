const isItNeedToNotify = require("../lodash/verifyIsEqual");

const {
    postCardapio,
    getAllCardapioFromDB,
    dropCollection,
  } = require("../databases/querys");
  

const { getNewCardapioFromSite } = require("../cardapio/getCardapio");
const {novoCardapioDaSemana} = require("../firebase/push-notification");

const { todayDate } = require("../utils/getTodayDate");
const { timestamps } = require("../utils/getTimestamps");

/**
 * Checks if the new cardapio of the week needs to be posted and notifies all users.
 * 
 * @async
 * @returns {Promise<void>} - A promise that resolves when the new cardapio is posted and all users are notified.
 */
async function newCardapioOftheWeek(next) {
    console.info(`> ${timestamps()} - ${todayDate()}: Checking for new cardapio of the week...`);
    // Get the current date in the format 'DD-MM-YYYY'
    const toDay = todayDate();
  
    // Get all cardapios from the database
    const oldCardapio = await getAllCardapioFromDB((doc) => doc);
  
    let isTodyCardapioInOldCardapio;
    // Check if the current date is in the cardapios
   
    isTodyCardapioInOldCardapio = oldCardapio.some((cardapio) => {
    return cardapio.data === toDay;
    });

    // Get the new cardapio from the site
    const newCardapio = await getNewCardapioFromSite();
  
    // Check if the new cardapio already exists
    const isNewCardapio = newCardapio.some((newC) => {
      return newC.dia[1] != toDay;
    });
  
    // Check if the current date is in the cardapios and if the number of cardapios is greater than 5
    if (isTodyCardapioInOldCardapio && oldCardapio.length > 5) {
      // Drop the collection and post the new cardapio
      const isDrop = await dropCollection((e) => e);
      if (isDrop) {
        await postCardapio(newCardapio, (e) => {});
        return await next('cardapio');
      }
    }
  
    // Check if the new cardapio already exists
    if (isTodyCardapioInOldCardapio && !isNewCardapio) {
        console.info(`> ${timestamps()} - ${todayDate()}: Not need to do anything, all is ok.`);
        return
    }
    // Drop the collection and post the new cardapio
    await dropCollection(async (e) =>{
      if (!e) {
          console.info(`> ${timestamps()} - ${todayDate()}: Not need to do anything, all is ok.`);
          return
      }
      console.info(`> ${timestamps()} - ${todayDate()}: Inserting new cardapio of the week ...`);
      await postCardapio(newCardapio, (e) => {});
      console.info(`> ${timestamps()} - ${todayDate()}: Inserting new cardapio of the week is complete.`);
      // Notify all users that the cardapio has changed
      await novoCardapioDaSemana();
      return await next('cardapio');
    });
  }

  module.exports = {newCardapioOftheWeek};