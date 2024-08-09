const express = require("express");
const router = express.Router();

const isItNeedToNotify = require("../lodash/verifyIsEqual");
const {
  postCardapio,
  getAllCardapioFromDB,
  dropCollection,
  findOneCardapioByDateAndupdate,
  findCardapioByDate,
  postUsersTokens,
  postNews,
  getNews,
} = require("../databases/querys");

const { getNewCardapioFromSite, getTodayCardapio } = require("../cardapio/getCardapio");
const {
  notifyUserCardapioDeHojeMudou,
  novoCardapioDaSemana,
} = require("../firebase/push-notification");

router.get("/", async (req, res) => {
  res.status(503).send("Servidor em manutenção");
});

router.post("/new", async (req, res) => {
  main();
  res.send("ok");
});

// get request to get all cardapio from database
router.get("/api", async (req, res) => {
  
  let resolute=[];

  resolute = await getAllCardapioFromDB((doc) => doc);

  if (resolute.length > 6) {
    const isBeDrop = await dropCollection((e) => e);

    if (isBeDrop) {
      await newCardapioOftheWeek();
    }
  }
  if (!(resolute.length > 0)) {
    await main();
    resolute = await getAllCardapioFromDB((doc) => doc);
  }

  res.json(resolute);
});


// post request to add new token of user to database
router.post("/token", async (req, res) => {
  await postUsersTokens(req, (next) => {
    // console.log(next +1);
  });
  res.send("ok");
});

// post request to add news
router.post("/news", async (req, res) => {
  await postNews(req, res);
});

// get request to get news
router.get("/news", async (req, res)=>{
  const resolute = await getNews((doc)=>doc);
  res.json(resolute);
})


/**
 * Returns the current date in the format 'DD-MM-YYYY'.
 *
 * @return {string} The current date.
 */
function todayDate() {
  const date = new Date(); // Get the current date

  // If the day is less than 10, add a leading zero
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();

  // If the month is less than 10, add a leading zero
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;

  // Return the current date in the format 'DD-MM-YYYY'
  return `${day}-${month}-${date.getFullYear()}`;
}

/**
 * Returns the current time in the format 'HH:mm:ss'.
 *
 * @return {string} The current time.
 */
function timestamps() {
  // Create a new Date object to get the current date and time
  const date = new Date();

  // Get the hours, minutes, and seconds from the current time
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Format the time as 'HH:mm:ss' and return it
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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

/**
 * Checks if the new cardapio of the week needs to be posted and notifies all users.
 * 
 * @async
 * @returns {Promise<void>} - A promise that resolves when the new cardapio is posted and all users are notified.
 */
async function newCardapioOftheWeek() {
  console.info(`> ${timestamps()} - ${todayDate()}: Checking for new cardapio of the week...`);
  // Get the current date in the format 'DD-MM-YYYY'
  const toDay = todayDate();

  // Get all cardapios from the database
  const oldCardapio = await getAllCardapioFromDB((doc) => doc);

  // Check if the current date is in the cardapios
  const isTodyCardapioInOldCardapio = oldCardapio.some((cardapio) => {
    return cardapio.data === toDay;
  });

  // Get the new cardapio from the site
  const newCardapio = await getNewCardapioFromSite();

  // Check if the new cardapio already exists
  const isNewCardapio = newCardapio.some((newC) => {
    return newC.dia[1] === toDay;
  });

  // Check if the current date is in the cardapios and if the number of cardapios is greater than 5
  if (isTodyCardapioInOldCardapio && oldCardapio.length > 5) {
    // Drop the collection and post the new cardapio
    const isDrop = await dropCollection((e) => e);
    if (isDrop) {
      await postCardapio(newCardapio, (e) => {});
      return;
    }
  }

  // Check if the new cardapio already exists
  if (!isTodyCardapioInOldCardapio && isNewCardapio) {
    // Drop the collection and post the new cardapio
    await dropCollection(async (e) =>{
      if (e) {
        console.info(`> ${timestamps()} - ${todayDate()}: Inserting new cardapio of the week ...`);
        await postCardapio(newCardapio, (e) => {});
        console.info(`> ${timestamps()} - ${todayDate()}: Inserting new cardapio of the week is complete.`);
        // Notify all users that the cardapio has changed
        await novoCardapioDaSemana();
        return;
      }
    });
  }else{
    console.info(`> ${timestamps()} - ${todayDate()}: Not need to do anything, all is ok.`);
  }
}

module.exports = {router,newCardapioOftheWeek,update };
