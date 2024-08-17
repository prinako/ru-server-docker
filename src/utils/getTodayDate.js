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


module.exports = {todayDate}