require("dotenv").config();

const express = require("express");
const redis = require("redis");
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

const REDIS_URL = process.env.REDIS_URL;
const client = redis.createClient(
  {
    url: REDIS_URL,
  }
);
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect().then(() => console.log("connected"));

router.get("/", async (req, res) => {
  res.status(500);
});

router.post("/new", async (req, res) => {
  main();
  res.send("ok");
});

/**
 * Cache middleware for the API route. Checks if the cache exists, if it does,
 * sends the cached data, otherwise fetches the data, caches it, and sends it.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function apiCache(req, res, next) {
  const key = await req.path; // Get the path of the request URL
  const cacheData = await client.get(key); // Get the cache data for the path

  if (cacheData !== null) { // If cache data exists
    console.log("cache"); // Log 'cache'
    res.json(JSON.parse(cacheData)); // Send the parsed cache data
  } else { // If cache data doesn't exist
    console.log("no cache"); // Log 'no cache'

    try {
      let resolute = []; // Initialize an empty array to store the data

      resolute = await getAllCardapioFromDB((doc) => doc); // Fetch the data

      if (resolute.length > 6) { // If the data length is more than 6
        const isBeDrop = await dropCollection((e) => e); // Drop the collection

        if (isBeDrop) { // If the collection is dropped
          await newCardapioOftheWeek(); // Create a new cardapio of the week
        }
      }

      if (!(resolute.length > 0)) { // If the data length is not more than 0
        await main(); // Run the main function
        resolute = await getAllCardapioFromDB((doc) => doc); // Fetch the data again
      }
      client.setEx(key, 3600, JSON.stringify(resolute)); // Cache the data
      res.json(resolute); // Send the data
    } catch (err) { // If an error occurs
      res.status(500).send([{ error: err }]); // Send a 500 status with the error
    }
  }

}

/**
 * Cache middleware for the news route. Checks if the cache exists, if it does,
 * sends the cached data, otherwise fetches the data, caches it, and sends it.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function newsCache(req, res, next) {
  const key = await req.path;
  const cacheData = await client.get(key); // Get the cache data for the path

  // If cache data exists
  if (cacheData !== null) {
    console.log("cache");
    res.json(JSON.parse(cacheData)); // Send the parsed cache data
  } else {
    console.log("no cache");
    try {
      // Fetch the news data
      const resolute = await getNews((doc) => doc);

      // Cache the data for 1 hour
      client.setEx(key, 3600, JSON.stringify(resolute));

      // Send the data
      res.json(resolute);
    } catch (err) {
      // If an error occurs, send a 500 status with the error
      res.status(500).send([{ error: err }]);
    }
  }
}

// get request to get all cardapio from database
router.get("/api", apiCache);

// get request to get news
router.get("/news", newsCache);

// post request to add news
router.post("/news", async (req, res) => {
  await postNews(req, res);
});

// post request to add new token of user to database
router.post("/token", async (req, res) => {
  await postUsersTokens(req, (next) => {
    // console.log(next +1);
  });
  res.send("ok");
});

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
