require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

//connecting mongo database
// (async () => {
//   mongoose.set("strictQuery", false);
//   await mongoose
//     .connect(process.env.MONGO)
//     .then(() => console.log("Connected to mongo database"))
//     .catch((err) => console.error(err));
// })();

const { main, drop, router, checkForUpdate } = require("./main/main.js");

// const {notifyUserCardapioDeHojeMudou} = require("./firebase/push-notification");
// notifyUserCardapioDeHojeMudou();


cron.schedule(
  "*/10 * * * * *",
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

// cron.schedule(
//   "0 23 * * 0",
//   function () {
//     drop();
//     console.log("This runs every 5 minutes");
//   },
//   {
//     scheduled: true,
//     timezone: "America/Sao_Paulo",
//   }
// );

//const db = mongoose.connection;

app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
