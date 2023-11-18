// Importa os modelos do Mongoose ou esquemas (presumivelmente
// definidos em "schema.js")
const { CardapioH, UsersTokensH } = require("./schema");

// Formata os dados do cardápio para um novo formato
/**
 * Formats the provided data into a structured menu item object for database storage.
 *
 * @param {Object} dados - The data to be formatted.
 * @param {Function} next - The callback function to be executed with the formatted data.
 * @returns {Promise<any>} - A promise that resolves with the result of the callback function.
 */
async function formatCardapioFroDatabase(dados, next) {
  const novoCadapio = {
    dia: dados.dia[0],
    data: dados.dia[1],
    amoco: {
      refeicao: "ALMOÇO",
      nomeDaRefei: dados.almoco[0],
      ingredintes: {
        amo1: dados.almoco[3],
        amo2: dados.almoco[4],
        amo3: dados.almoco[5],
        amo4: dados.almoco[6],
        amo5: dados.almoco[7],
      },
      vegetariano1: dados.almoco[2],
    },
    jantar: {
      refeicao: "JANTAR",
      nomeDaRefei: dados.jantar[0],
      ingredintes: {
        jan1: dados.jantar[3],
        jan2: dados.jantar[4],
        jan3: dados.jantar[5],
        jan4: dados.jantar[6],
        jan5: dados.jantar[7],
      },
      vegetariano2: dados.jantar[2],
    },
  };
  return next(novoCadapio);
}

let dataCount = 0;
// Função para adicionar um novo cardápio
/**
 * Posts a new menu item to the database.
 *
 * @param {Object} dados - The data for the new menu item.
 * @param {Function} next - The callback function to be executed after the menu item is posted.
 * @returns {Promise<void>} - A promise that resolves when the menu item is successfully posted.
 */
async function postCardapio(dados, next) {
  await formatCardapioFroDatabase(dados, async (novoCadapio) => {
    const verifyBeforeTnsert = await findCardapioByDate(
      novoCadapio.data,
      (d) => d
    );

    const d = new CardapioH(novoCadapio);

    if (!verifyBeforeTnsert) {
      await d
        .save()
        .then(async (resolute) => {
          // await connectMongoDBserver(d);
          dataCount += 1;
          // console.log(dataCount)
          next(dataCount);
        })
        .catch((err) => {
          console.log(err);
          next(err.keyValue);
        });
    }
  });
  // console.log(dataCount)
}

// Função fictícia para conectar-se ao servidor MongoDB
// (precisa ser implementada)
async function connectMongoDBserver(dados) {
  console.log(`we wii connect soon: ` + dados);
}

// Função para atualizar um cardápio existente
/**
 * Updates the menu items in the database with the provided data.
 *
 * @param {Object} dados - The data to update the menu items with.
 * @returns {Promise<void>} - A promise that resolves when the update is completed.
 */
async function updateCardapio(dados) {
  formatCardapioFroDatabase(dados, async (novoCadapio) => {
    // await CardapioH.findOneAndUpdate({ data: dados.dia[1] }, novoCadapio, {
    //   upsert: true,
    // })
    await CardapioH.findOneAndUpdate({ data: novoCadapio.data }, novoCadapio, {
      upsert: true,
    })
      .then()
      .catch((err, duc) => {
        console.log(err);
        if (err) {
          console.log(err);
          return false;
        }
        return true;
      });
    // .clone();
    return;
  });
}

// Função para obter todos os cardápios
/**
 * Retrieves all menu items from the database and passes them to the provided callback function.
 *
 * @param {Function} next - The callback function to be executed with the retrieved menu items.
 * @returns {Promise<any>} - A promise that resolves with the result of the callback function.
 */
async function todosOsCardapio(next) {
  const rs = await CardapioH.find().clone();
  return next(rs);
}

/**
 * Find a menu by date and pass it to the provided callback function.
 *
 * @param {string} data - The date to search for the menu.
 * @param {Function} next - The callback function to receive the menu.
 * @returns {Promise<void>} A promise that resolves with the result of the callback function.
 *
 * @description
 * This function searches for a menu in the `Cardapio` collection based on the provided date. The menu with the matching date is retrieved using the `findOne` method with the condition `{ data: data }`. The result is then passed to the provided callback function using the `next` parameter. The result of the callback function is returned as a promise.
 */
async function findCardapioByDate(data, next) {
  const cardapio = await CardapioH.findOne({ data: data });
  return next(cardapio);
}

/**
 * Retrieve all user tokens and pass them to the provided callback function.
 *
 * @param {Function} next - The callback function to receive the user tokens.
 * @returns {Promise<void>} A promise that resolves with the result of the callback function.
 *
 * @description
 * This function retrieves all user tokens from the `UsersTokensH` collection and passes them to the provided callback function using the `next` parameter. The user tokens are obtained by querying the collection and iterating over the result to extract the tokens. The result of the callback function is returned as a promise.
 */
async function getAllUsersTokens(next) {
  allTokens = [];
  const rs = await UsersTokensH.find().clone();
  rs.forEach((tk) => allTokens.push(tk.token));
  // console.log(allTokens);
  return next(allTokens);
}

// Função para excluir a coleção de cardápios

/**
 * Drop the CardapioH collection and verify the result.
 *
 * @param {Function} next - The callback function to receive the result of the operation.
 * @returns {Promise<void>} A promise that resolves with the result of the callback function.
 *
 * @description
 * This function drops the CardapioH collection. It first verifies if a new cardápio has been added or not. The result of the operation is passed to the provided callback function using the `next` parameter. If the collection is dropped successfully, the callback function is called with `true`. If an error occurs during the operation, the error is logged to the console and the callback function is called with `false`. The result of the callback function is returned as a promise.
 */
async function dropCollection(next) {
  // verify collection if new cardápio has ben added or not.
  // const toBeVerified = await todosOsCardapio((e) => e);

  await CardapioH.collection
    .drop()
    .then((e) => next(true))
    .catch((err) => {
      console.error(err);
      return next(false);
    });
}

// Função para obter o formato do cardápio para verificação
/**
 * Formats the provided data into a structured menu item object for verification and passes it to the provided callback function.
 *
 * @param {Object} dados - The data to be formatted.
 * @param {Function} next - The callback function to be executed with the formatted data.
 * @returns {Promise<any>} - A promise that resolves with the result of the callback function.
 */
async function getCardapioFormatToVerify(dados, next) {
  await formatCardapioFroDatabase(dados, (cardapioFormatado) => {
    return next(cardapioFormatado);
  });
}

// Exporta as funções como módulo
module.exports = {
  postCardapio,
  todosOsCardapio,
  findCardapioByDate,
  updateCardapio,
  dropCollection,
  getAllUsersTokens,
  formatCardapioFroDatabase,
  getCardapioFormatToVerify,
};
