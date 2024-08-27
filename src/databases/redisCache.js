require("dotenv").config();
const redis = require("redis");
const {
    getNews,
    getAllCardapioFromDB,
    dropCollection
} = require("./querys");

const {newCardapioOftheWeek} = require("../main/insertNewCardapioOfTheWeek");

const REDIS_URL = process.env.REDIS_URL;

const client = redis.createClient(
  {
    url: REDIS_URL,
  }
);
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect().then(() => console.log("connected"));


/**
 * Cache middleware for the API route. Checks if the cache exists, if it does,
 * sends the cached data, otherwise fetches the data, caches it, and sends it.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function apiCache(req, res, next) {
    const key = "cardapio"; // Get the path of the request URL
    const cacheData = await client.get(key); // Get the cache data for the path

    if (cacheData !== null) { // If cache data exists
        console.log("cache"); // Log 'cache'
        res.json(JSON.parse(cacheData)); // Send the parsed cache data
    } else { // If cache data doesn't exist
        console.log("no cache"); // Log 'no cache'

        try {
        let resolute = []; // Initialize an empty array to store the data
         
        resolute = await cacheNewData(key);

        res.json(resolute); // Send the data
        } catch (err) { // If an error occurs
            res.status(500).send([{ error: err }]); // Send a 500 status with the error
        }
    }
    
    async function cacheNewData(key) {
        let resolute = [];
        
        resolute = await getAllCardapioFromDB((doc) => doc);
        if (!(resolute.length > 0)) {
            return resolute;
        }
        if (resolute.length > 6) {
            const isBeDrop = await dropCollection((e) => e);
            if (isBeDrop) {
                // await dropCacheWithKey(key);
                await newCardapioOftheWeek(dropCacheWithKey);
            }
            resolute = await getAllCardapioFromDB((doc) => doc);
        }
        client.setEx(key, 3600, JSON.stringify(resolute));

        return resolute;
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
    const key = "news";
    const cacheData = await client.get(key); // Get the cache data for the path
    
    
    // If cache data exists
    if (cacheData !== null) {
        console.log("cache");
        const data = JSON.parse(cacheData);

        if (data.length > 0) {
            res.json(data);
            return;
        }

        const dataFromDB = await main();
        if (dataFromDB) {
            res.json(dataFromDB);
            return;
        }
        
    } else {
        console.log("no cache");
        try {
            // Fetch the news data
            const resolute = await main();
            
            if (resolute) {
                // Send the data
                res.json(resolute);
                return
            }
            res.json([]);
        } catch (err) {
            // If an error occurs, send a 500 status with the error
            res.status(500).send([{ error: err }]);
        }
    }

    /**
     * Fetches the news data from the database, caches it for 1 hour, and returns it.
     *
     * @returns {Promise<Array|boolean>} - The news data from the database, or false if no data is found.
     */
    async function main() {
        // Fetch the news data from the database
        const resolute = await getNews((doc) => doc);

        // If news data is found
        if (resolute.length > 0) {
            // Cache the news data for 1 hour
            client.setEx(key, 3600, JSON.stringify(resolute));

            // Return the news data
            return resolute;
        }

        // Return false if no news data is found
        return false;
    }
}

/**
 * Deletes a cache entry with the given key.
 * 
 * @param {string} key - The key of the cache entry to delete.
 * @returns {Promise<boolean>} - A promise that resolves to true if the cache entry was deleted, false otherwise.
 */
async function dropCacheWithKey(key) {
   // Call the client's delete method to delete the cache entry with the given key
   const isDel = await client.del(key);

   // If the cache entry was deleted, log a message
   if (isDel) {
      console.log("cache dropped");
   }

   // Return whether the cache entry was deleted
   return;
}

module.exports = { apiCache, newsCache, dropCacheWithKey };