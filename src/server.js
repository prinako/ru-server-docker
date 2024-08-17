require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cron = require("node-cron");

// import libraries locals
const router = require('./main/routers.js');
const {update} = require('./main/getUpdate.js');
const {newCardapioOftheWeek} = require('./main/insertNewCardapioOfTheWWeek.js');
const {dropCacheWithKey} = require('./databases/redisCache.js');

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

/**
 * Connects to the MongoDB database.
 * 
 * @async
 * @returns {Promise<void>} - A promise that resolves when the connection is established.
 */
async function contectDB(next) {
  try {
    // mongoose.set("strictQuery", false);
    const db = await mongoose.connect(process.env.MONGO, clientOptions);
    console.info("Connected to mongo database " + db.connection.name);
    return next(true);
  } catch (err) {
    console.error(err);
    return next(false);
  }
};

contectDB(async(e) => {
  if (!e) {
    console.error("Connection failed");
    return;
  }
  console.info("Connection successful");
  console.info("################# -< Updating cardapio >- ###############################");
  await newCardapioOftheWeek(dropCacheWithKey);
  // await dropCacheWithKey("cardapio");
});

/**
 * Disconnects from the MongoDB database.
 * 
 * @async
 * @returns {Promise<void>} - A promise that resolves when the disconnection is complete.
 */
const disconnetDB = async () => {
  try {
    await mongoose.disconnect();
    console.info("Disconnected from mongo database");
  } catch (err) {
    console.error(err);
  }
};

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;


app.use('/', router);


let options = {
  scheduled: true,
  timezone: "America/Sao_Paulo",
};

cron.schedule(
  "*/30 9-12 * * 1-2",
  async () => {
    
    await newCardapioOftheWeek(dropCacheWithKey);
  },
  options
);

cron.schedule(
  "*/20 8-19 * * 1-5",
  async () => {
    await update(dropCacheWithKey);
  },
  options
);

// cron.schedule(
//   "*/1 * * * * *",
//   async () => {
//     await update();
//     console.log("Updating cardapio");
//   },
//   options
// );

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
