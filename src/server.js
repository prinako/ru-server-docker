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

cron.schedule(
  "*/30 * * * 0-2",
  async () => {
    // console.log("hi");
    // await update();
    await main();
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);
main()

// checkForUpdate()

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
