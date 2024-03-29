require("dotenv").config();

const cron = require("node-cron");

const {
  main,
  checkForUpdate,
  notifyUserCardapioDoDia,
} = require("./main/main.js");

let options = {
  scheduled: true,
  timezone: "America/Belem",
};

/**
 * Schedule a cron job to execute a function every 15 minutes from Monday to Friday.
 *
 * @param {string} pattern - The cron pattern specifying the schedule for the job.
 * @param {Function} callback - The function to be executed by the cron job.
 * @param {Object} options - Additional options for the cron job.
 * @returns {CronJob} The cron job instance.
 *
 * @description
 * This code schedules a cron job using the `cron.schedule` function from the `cron` library. The cron job is configured to execute the provided callback function every 15 minutes from Monday to Friday. The cron job is created with the specified pattern, callback, and options. The function returns the cron job instance.
 */

cron.schedule(
  "*/15 * * * 1-5",
  // "*/1 * * * *",
  async () => {
    // console.log("hi");
    // await update();
    await checkForUpdate();
  },
  options
);

cron.schedule(
  "*/40 * * * 0-2",
  async () => {
    // console.log("hi");
    await main();
  },
  options
);

cron.schedule(
  "* 11 * * 1-5",
  async () => {
    console.log("hi");
    await notifyUserCardapioDoDia(1);
  },
  options
);

cron.schedule(
  "0 16 * * 1-5",
  async () => {
    console.log("hi");
    await notifyUserCardapioDoDia(2);
  },
  options
);

/**
 * Immediately invoke an async function to execute the main function.
 *
 * @returns {Promise<void>} A promise that resolves when the main function is completed.
 *
 * @description
 * This code immediately invokes an async function using an IIFE (Immediately Invoked Function Expression) to execute the main function. The main function is awaited to ensure its completion. The code returns a promise that resolves when the main function is completed.
 */
(async () => {
  await main();
  // await checkForUpdate();
})();
