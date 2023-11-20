const mongoose = require("mongoose");

const homeDB_Url = process.env.HOMEMONGO;
const serverDB_Url = process.env.SERVERDB;

/**
 * Connects to the homeDB and serverDB MongoDB databases and returns the connections.
 * @returns {Object} - An object containing the connections to the homeDB and serverDB databases.
 */
const connectDBs = () => {
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  };
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
