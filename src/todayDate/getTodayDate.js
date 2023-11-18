/**
 * Get the current date in the format "DD-MM-YYYY" and pass it to the provided callback function.
 *
 * @param {Function} next - The callback function to receive the current date.
 * @returns {Promise<void>} A promise that resolves with the result of the callback function.
 *
 * @description
 * This function retrieves the current date and formats it as "DD-MM-YYYY". It then passes the formatted date to the provided callback function using the `next` parameter. The result of the callback function is returned as a promise.
 */
async function getTodayDate(next) {
  const date = new Date();

  let toDayDate;

  if (date.getMonth() > 9) {
    toDayDate = `${date.getDate()-1}-${
      date.getMonth() +1
    }-${date.getFullYear()}`;
  } else {
    toDayDate = `${date.getDate()}-0${
      date.getMonth() + 1
    }-${date.getFullYear()}`;
  }
  return next(toDayDate);
}

module.exports = {getTodayDate}