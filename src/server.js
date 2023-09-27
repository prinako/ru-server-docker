require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require('node-cron');
// const helmet = require("helmet");

const port = process.env.PORT || 5500;

const app = express();

// app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { main, dropDatabase, router, checkForUpdate } = require("./main/main.js");

cron.schedule(
  "*/30 * * * * *",
  async () => {
    console.log("hi");
    // await update();
    await checkForUpdate();
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

cron.schedule(
  "45 9-17 * * 1-3",
  function () {
    dropDatabase();
    console.log("This runs every 5 minutes");
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

//const db = mongoose.connection;

app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
