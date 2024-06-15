require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');

let dateObj = new Date();

/**
 * Retrieves all cardápio (menu) data from a website and invokes a callback function.
 * 
 * @async
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is retrieved.
 */
async function getFromSiteCardapio() {
    // ru server base url
    const baseURL = process.env.RUBASESITE;

    // ru server subnet
    const subnet = process.env.RUSUBNET;

    const cardapios = [];

    const api = await axios.create({
        baseURL: baseURL,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    });

    try {
        const { data } = await api.get(subnet);

        const $ = cheerio.load(data)
        const memSelector = '#content-section > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr'

        const keys = [
            'dia',
            'almoco',
            'jantar'
        ]

        $(memSelector).each((parentIdx, parentElem) => {

            let keyIdx = 0
            const cardapioObj = {}

            if (parentIdx) {
                $(parentElem).children().each((childIdx, childElem) => {

                    let tdValue = $(childElem).text()
                    const p = tdValue.replace(/\t\s+/g, '').trim().split(/[;\n:]/)

                    cardapioObj[keys[keyIdx]] = p
                    cardapioObj.dia[0] = cardapioObj.dia[0].replace('/', '-')
                    keyIdx++
                })
                cardapioObj.dia[1] = (cardapioObj.dia[1]).replace('/', '-') + `-${dateObj.getFullYear()}`

                cardapios.push(cardapioObj)
            }
        });

        return cardapios;
    }
    catch (err) {
        console.log(`Something went wrong! Status: ${err.response.status} and Status Text: ${err.response.statusText}`);
        return false;
    }
}

module.exports = getFromSiteCardapio;