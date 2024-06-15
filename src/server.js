require("dotenv").config();

const mongoose = require('mongoose');
const cron = require("node-cron");

const getFromSiteCardapio = require("./cardapio/getCardapio");

const { isItNeedToNotify, isDataEqual } = require("./lodash/verifyIsEqual");
const {
  postCardapio,
  todosOsCardapio,
  dropCollection,
  updateByDateCardapio,
} = require("./databases/querys");

const {
  notifyUserCardapioDeHojeMudou,
  novoCardapioDaSemana,
} = require("./firebase/push-notification");

const { insertIntoDB, findOneByDate, findAndUpdate } = require("./databases/sqlite");

const { insertIntoVerifyDB, findOneByDateInVerifyDB } = require("./databases/verifyDB");

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
    console.log("Connected to mongo database" + db.connection.name);
    return next(true);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Disconnects from the MongoDB database.
 * 
 * @async
 * @returns {Promise<void>} - A promise that resolves when the disconnection is complete.
 */
const disconnetDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from mongo database");
  } catch (err) {
    console.log(err);
  }
};

let options = {
  scheduled: true,
  timezone: "America/Sao_Paulo",
};

cron.schedule(
  "*/30 9-12 * * 1-2",
  async () => {
    await main();
  },
  options
);

cron.schedule(
  "*/20 8-19 * * 1-5",
  async () => {
    await update();
  },
  options
);
// cron.schedule(
//   "*/1 * * * * *",
//   async () => {
//     await update();
//   },
//   options
// );

/**
 * Updates the cardápio (menu) and invokes a callback function.
 * 
 * @async
 * @param {Function} callback - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
async function update() {
  console.log("Updating cardapio");
  const dataFromRuSite = await getFromSiteCardapio();

  if(dataFromRuSite === false) {
    return false;
  }

  await insertIntoVerifyDB(dataFromRuSite, async (verify) => {
    if (await verify === true) {
      const date = new Date();
      let toDayDate;
      
      if (date.getDate().toString().length === 1) {
        toDayDate = `0${date.getDate() - 1}-0${date.getMonth() + 1
        }-${date.getFullYear()}`;
      } else {
        toDayDate = `${date.getDate() - 1}-${date.getMonth() + 1
        }-${date.getFullYear()}`;
      }
      
      await findOneByDateInVerifyDB(toDayDate, async (verifyData) => {
        await findOneByDate(toDayDate, async (oldData) => {
          
          // verify if verifyData and oldData are not empty
          if(verifyData.length === 0 || oldData.length === 0) return;
          
          const isEqual = await isDataEqual(oldData, verifyData);
          
          if (!isEqual) {
            // to update
            await findAndUpdate(toDayDate, verifyData);
            await findOneByDate(toDayDate, async (newData) => {
              await contectDB(async (next) => {
                if (next) {
                  await updateByDateCardapio(toDayDate, await newData, async (next) => {
                    await isItNeedToNotify(oldData, newData, async ({ almoco, jantar }) => {
                      if (almoco || jantar) {
                        await notifyUserCardapioDeHojeMudou({
                          almoco,
                          jantar
                        });
                      }
                    });
                  });
                  await disconnetDB();
                }
              })
            });
          }
        })
      });
    }
  });
  return;
}

main();
async function main() {
  const ruSiteData = await getFromSiteCardapio();

  if(ruSiteData === false) {
    return false;
  }

  await insertIntoDB(ruSiteData, async (next) => {
    if (next) {
      await contectDB(async (next) => {
        if (next) {
          await postCardapio(ruSiteData, async (next) => {
            if (next) {
              await DBset(ruSiteData);
            }
          });
        }
        await disconnetDB();
      });
    }
  });
  return;
}

/**
 * Sets the database with the given cardapio if the number of cardapios is greater than 6.
 *
 * @async
 * @param {Array} cardapio - The cardapio data to be set in the database.
 * @return {Promise<void>} - A promise that resolves when the database is set.
 */
async function DBset(cardapio) {
  const AllCardapio = await todosOsCardapio(async (next) => next);
  if (AllCardapio.length > 6) {
    console.log("DB set");
    await dropCollection(async next => {
      if (next) {
        await postCardapio(cardapio, async (next) => {
          if (next) {
            console.log("novo cardapio criado");
            await novoCardapioDaSemana();
          }
        });
      }
    });
  }
  return;
}