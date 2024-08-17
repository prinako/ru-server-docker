// read .env
require('dotenv');

// import libraries
const axios = require('axios');
const cheerio = require('cheerio');


/**
 * Configures the Axios instance with the base URL and headers
 * from the environment variables and returns the data retrieved
 * from the specified subnet.
 *
 * @async
 * @returns {Promise<string>} - A promise that resolves to the data retrieved from the subnet.
 * @throws {Error} - If there is an error while retrieving the data.
 */
async function getHTMLfromSite() {
    // Get the base URL from the environment variable
    const baseURL = process.env.RUBASESITE;
    // Get the subnet from the environment variable
    const subnet = process.env.RUSUBNET;
    // Array to store the cardapios

    // Create an Axios instance with the base URL and headers
    const api = await axios.create({
        baseURL: baseURL,
        headers: {
            // Set the User-Agent header
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36',
            // Set the Accept header
            'Accept': 'application/json, text/plain, */*',
            // Set the Accept-Language header
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            // Set the Accept-Encoding header
            'Accept-Encoding': 'gzip, deflate, br',
        }
    });

    try {
        // Make a GET request to the specified subnet and retrieve the data
        const { data } = await api.get(subnet);
        // Return the data
        return data;
    } catch (error) {
        // Log any errors that occur
        console.log(error);
        // Throw an error
        throw error;
        // return false;
    }
}

// get current date
let dateObj = new Date();

/**
 * Retrieves cardapios (menus) from a website and returns them as an array of objects.
 *
 * @return {Promise<Array>} An array of cardapios, each represented as an object with 
 * properties 'dia', 'almoço', and 'jantar'. If there is an error while retrieving the data,
 * returns false.
 */
async function getNewCardapioFromSite() {
    const cardapios = []; // Array to store the cardapios

    const data = await getHTMLfromSite(); // Get the HTML content from the site
    if (!data) { // If there is no data, log an error and return false
        console.log(`Something went wrong! Status: ${err.response.status} and Status Text: ${err.response.statusText}`);
        return false;
    }

    // Load the HTML content using Cheerio
    const $ = cheerio.load(data);

    // Define the CSS selector for the cardapios table rows
    const memSelector = '#content-section > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr';

    // Define the keys for the cardapio object properties
    const keys = [
        'dia', // Represents the day of the cardapio
        'almoco', // Represents the lunch menu
        'jantar' // Represents the dinner menu
    ];

    // Iterate over each row in the cardapios table
    $(memSelector).each((parentIdx, parentElem) => {

        let keyIdx = 0; // Index for the keys array
        const cardapioObj = {}; // Object to store the properties of a cardapio

        if (parentIdx) { // Skip the first row, which contains the column names
            $(parentElem).children().each((childIdx, childElem) => {

                let tdValue = $(childElem).text(); // Value of the current cell
                const p = tdValue.replace(/\t\s+/g, '').trim().split(/[;\n:]/); // Split the value into an array

                cardapioObj[keys[keyIdx]] = p; // Assign the array to the corresponding property
                cardapioObj.dia[0] = cardapioObj.dia[0].replace('/', '-'); // Format the day property
                keyIdx++; // Increment the key index
            });

            // Format the day property and add the year to it
            cardapioObj.dia[1] = (cardapioObj.dia[1]).replace('/', '-') + `-${dateObj.getFullYear()}`;

            cardapios.push(cardapioObj); // Add the cardapio object to the array
        }
    });

    return cardapios;
}


/**
 * Retrieves the cardápio (menu) for a specific date.
 * 
 * @async
 * @param {string} date - The date to search for.
 * @param {function} next - The callback function.
 * @returns {Promise<object>} - A promise that resolves with the cardápio for the specified date.
 */
async function getTodayCardapio(date, next) {
    // Retrieve all cardápios from the website
    const cardapios = await getNewCardapioFromSite();
    
    // Find the cardápio for the specified date among the retrieved cardápios 
    const todayCardapio = cardapios.find((cardapio) => cardapio.dia[1] === date);
    
    // Invoke the callback function with the found cardápio
    return next(todayCardapio);
}

module.exports = { getNewCardapioFromSite, getTodayCardapio }; // Export the function