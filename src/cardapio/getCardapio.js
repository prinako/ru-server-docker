require("dotenv");
const axios = require("axios");
const cheerio = require("cheerio");

let dateObj = new Date();

/**
 * Retrieves the cardapio data from saest.ufpa.br, formats it, and passes it to the next function.
 * @async
 * @param {Function} next - The callback function to be called with the formatted cardapio data or false if an error occurs.
 * @returns {Promise<void>} - A promise that resolves when the cardapio data is retrieved, formatted, and passed to the next function.
 */
async function getAllCardapio(next) {
  console.log(
    "---------------------\nfaching from saest.ufpa.br \n---------------------"
  );

  let cardapioArry = [];

  const siteRuUrl = process.env.RUSITE;
  try {
    const { data } = await axios({
      method: "get",
      url: siteRuUrl,
    });

    const $ = cheerio.load(data);
    const memSelector =
      "#content-section > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr";

    const keys = ["dia", "almoco", "jantar"];

    $(memSelector).each((parentIdx, parentElem) => {
      let keyIdx = 0;
      let cardapioObj = {};

      if (parentIdx) {
        $(parentElem)
          .children()
          .each((childIdx, childElem) => {
            let tdValue = $(childElem).text();
            const p = tdValue
              .replace(/\t\s+/g, "")
              .trim()
              .split(/[;\n:]/);

            cardapioObj[keys[keyIdx]] = p;
            cardapioObj.dia[0] = cardapioObj.dia[0].replace("/", "-");
            keyIdx++;
          });
        cardapioObj.dia[1] =
          cardapioObj.dia[1].replace("/", "-") + `-${dateObj.getFullYear()}`;

        const novoCadapio = {
          dia: cardapioObj.dia[0],
          data: cardapioObj.dia[1],
          amoco: {
            refeicao: "ALMOÇO",
            nomeDaRefei: cardapioObj.almoco[0],
            ingredintes: {
              amo1: cardapioObj.almoco[3],
              amo2: cardapioObj.almoco[4],
              amo3: cardapioObj.almoco[5],
              amo4: cardapioObj.almoco[6],
              amo5: cardapioObj.almoco[7],
            },
            vegetariano1: cardapioObj.almoco[2],
          },
          jantar: {
            refeicao: "JANTAR",
            nomeDaRefei: cardapioObj.jantar[0],
            ingredintes: {
              jan1: cardapioObj.jantar[3],
              jan2: cardapioObj.jantar[4],
              jan3: cardapioObj.jantar[5],
              jan4: cardapioObj.jantar[6],
              jan5: cardapioObj.jantar[7],
            },
            vegetariano2: cardapioObj.jantar[2],
          },
        };

        cardapioArry.push(novoCadapio);
        // console.log(cardapioArry);
      }
    });
  } catch (err) {
    console.log(err);
    return next(false);
  }
  return next(cardapioArry);
}

module.exports = { getAllCardapio };
