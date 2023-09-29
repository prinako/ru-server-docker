require("dotenv").config();

const cron = require("node-cron");


const {main, checkForUpdate } = require("./main/main.js");

cron.schedule(
  "*/15 * * * 1-5",
  async () => {
    // console.log("hi");
    // await update();
    await checkForUpdate();
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

main()

// cron.schedule(
//   "45 9-17 * * 1-3",
//   function () {
//     dropDatabase();
//     console.log("This runs every 5 minutes");
//   },
//   {
//     scheduled: true,
//     timezone: "America/Sao_Paulo",
//   }
// );
