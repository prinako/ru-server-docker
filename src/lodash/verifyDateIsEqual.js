const isEqual = require("lodash/isEqual");
const {dataOfTheWeek } = require("../utils/getTodayDate");

/**
 * Checks if the old and new cardapio data are equal. If they are not equal,
 * it checks if the new data is equal to the current date of the week.
 * @param {Array} oldData - The old cardapio data.
 * @param {Array} newData - The new cardapio data.
 * @returns {boolean} - True if the new data is equal to the current date of the week, false otherwise.
 */
async function isCardapioDataIsEqual(oldDate, newDate) {
    const date_of_the_week = dataOfTheWeek();
    // If the old and new data are equal, return false
    if (isEqual(oldDate, newDate)) {
        return false;
    }
    // If the old and new data are not equal, check if the new data is equal to the current date of the week
    // If it is equal, return true
    const isEqualDate = isEqual(newDate, date_of_the_week);
    return isEqualDate;
}
// Export the function
module.exports = {isCardapioDataIsEqual};