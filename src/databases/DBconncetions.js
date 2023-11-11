const mongoose = require("mongoose");

const homeDB_Url = process.env.HOMEMONGO;
const serverDB_Url = process.env.SERVERDB;

/**
 * Connects to the MongoDB databases and returns the connection objects.
 *
 * @returns {Object} - An object containing the connections to the homeDB and serverDB.
 */
const connectDBs = () => {
  const mongooseOptions = { useUnifiedTopology: true };
  try {
    const homeDB = mongoose.createConnection(homeDB_Url, mongooseOptions);
    const serverDB = mongoose.createConnection(serverDB_Url, mongooseOptions);
    console.log("monogoDB is online");
    return { homeDB, serverDB };
  } catch (err) {
    console.log(`Error: :${err.message}`);
    process.exit(1);
  }
};

module.exports = { connectDBs };
