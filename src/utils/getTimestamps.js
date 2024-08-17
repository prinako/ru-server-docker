
/**
 * Returns the current time in the format 'HH:mm:ss'.
 *
 * @return {string} The current time.
 */
function timestamps() {
    // Create a new Date object to get the current date and time
    const date = new Date();
  
    // Get the hours, minutes, and seconds from the current time
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
  
    // Format the time as 'HH:mm:ss' and return it
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {timestamps};