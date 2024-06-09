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
async function getAllCardapio() {
    const siteRuUrl = process.env.RUSITE;
    const cardapios = [];

    try {
        const { data } = await axios({
            method: 'get',
            url: siteRuUrl,
        })

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

                // console.log(cardapioObj);
                cardapios.push(cardapioObj)
                // return next(cardapioObj);
            }
        });
        return cardapios;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}

module.exports = { getAllCardapio };