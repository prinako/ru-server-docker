/**
 * Returns the current date in the format 'DD-MM-YYYY'.
 *
 * @return {string} The current date.
 */
function todayDate() {
    const date = new Date(); // Get the current date
  
    // If the day is less than 10, add a leading zero
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  
    // If the month is less than 10, add a leading zero
    const month =
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  
    // Return the current date in the format 'DD-MM-YYYY'
    return `${day}-${month}-${date.getFullYear()}`;
}

/**
 * Returns the date that is 'num' days ahead of the current date.
 * The date is returned in the format 'DD-MM-YYYY'.
 *
 * @param {number} num - The number of days to add to the current date.
 * @return {string} The date that is 'num' days ahead of the current date,
 *                  in the format 'DD-MM-YYYY'.
 */
function nextDate(num) {
  const date = new Date(); // Get the current date

  // Add 'num' days to the current date
  date.setDate(date.getDate() + num);

  // If the day is less than 10, add a leading zero
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();

  // If the month is less than 10, add a leading zero
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;

  // Return the date in the format 'DD-MM-YYYY'
  return `${day}-${month}-${date.getFullYear()}`;
}


/**
 * Returns an array of dates for the next 6 days (including the current day),
 * starting from the current day.
 *
 * @return {Array} An array of dates, each date in the format 'DD-MM-YYYY'.
 */
function dataOfTheWeek() {
  const dataOfWeek = []; // Array to store the dates
  const date = new Date(); // Get the current date
  const day = date.getDay(); // Get the current day of the week (0-6)

  // Check the current day of the week
  switch (day) {
    // If the current day is Monday
    case 1:
      // Add the next 5 days to the array
      for (let i = 0; i < 5; i++) {
        dataOfWeek.push(nextDate(i));
      }
      break;
    // If the current day is Tuesday
    case 2:
      // Add the previous and next 5 days to the array
      for (let i = -1; i < 4; i++) {
        dataOfWeek.push(nextDate(i));
      }
      break;
    // If the current day is Wednesday
    case 3:
      // Add the previous, current, and next 4 days to the array
      for (let i = -2; i < 3; i++) {
        dataOfWeek.push(nextDate(i));
      }
      break;
    // If the current day is Thursday
    case 4:
      // Add the previous, current, and next 3 days to the array
      for (let i = -3; i < 2; i++) {
        dataOfWeek.push(nextDate(i));
      }
      break;
    // If the current day is Friday
    case 5:
      // Add the previous, current, and next 2 days to the array
      for (let i = -4; i < 1; i++) {
        dataOfWeek.push(nextDate(i));
      }
      break;
  }

  // Return the array of dates
  return dataOfWeek;
}

module.exports = {todayDate, nextDate, dataOfTheWeek}