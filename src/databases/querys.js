// Importa os modelos do Mongoose ou esquemas (presumivelmente
// definidos em "schema.js")
const { CardapioH, UsersTokensH } = require("./schema");


/**
 * Saves the cardapio data to the database using the `insertMany` method.
 * @async
 * @param {Array} dados - An array of cardapio data to be saved.
 * @param {Function} next - The callback function to be called after the cardapio data is saved.
 * @returns {Promise<void>} - A promise that resolves when the cardapio data is saved to the database.
 *
 * @description
 * This function saves the provided array of cardapio data to the database using the `insertMany` method from the `CardapioH` model. The `insertMany` method inserts multiple documents into the collection at once. If the save operation is successful, the function logs the result to the console. If an error occurs during the save operation, the error is logged to the console. The function returns a promise that resolves when the cardapio data is saved to the database.
 */
async function postCardapio(dados, next) {
  // const d = new CardapioH(dados);
  CardapioH.insertMany(dados)
    .then(() => {
      return next(true);
    })
    .catch((err) => {
      console.error(`
      --------------------------------------------- duplicate key -------------------------------
      "error", ${err.writeErrors[0].err.errmsg}
      --------------------------------------------------------------------------------------------`);
      return next(false);
    });
}

/**
 * Updates the cardapio data in the database with the provided data.
 * @async
 * @param {Array} dados - An array of cardapio data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the cardapio data is updated in the database.
 *
 * @description
 * This function iterates over each element in the provided array of cardapio data and updates the corresponding document in the database using the `findOneAndUpdate` method from the `CardapioH` model. The `upsert` option is set to `true` to create a new document if it doesn't exist. Any errors that occur during the update process are logged to the console. The function returns a promise that resolves when the update is completed.
 */
async function updateCardapio(dados) {
  dados.forEach(async (doc) => {
    // console.log(doc)
    await CardapioH.findOneAndUpdate({ data: doc.data }, doc, {
      upsert: true,
    })
      .then()
      .catch((err) => {
        console.log(err);

        return false;
      });
  });
  // .clone();
  return;
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


// Exporta as funções como módulo
module.exports = {
  postCardapio,
  todosOsCardapio,
  findCardapioByDate,
  updateCardapio,
  dropCollection,
  getAllUsersTokens,
};
