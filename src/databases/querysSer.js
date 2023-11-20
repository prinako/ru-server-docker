const { CardapioSer, UsersTokensSer } = require("./schema");

async function postCardapioSer(dados, next) {
  CardapioSer.insertMany(dados)
    .then(() => {
      return next(true);
    })
    .catch((err) => {
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
 * This function iterates over each element in the provided array of cardapio data and updates the corresponding document in the database using the `findOneAndUpdate` method from the `CardapioH` model. The `upsert` option is set to `true` to create a new document if it doesn't exist. Any errors that occur during the update process are logged to the console. The function returns a promise that resolves when the cardapio data is updated in the database.
 */
async function updateCardapioSer(dados) {
  dados.forEach(async (doc) => {
    // console.log(doc)
    await CardapioSer.findOneAndUpdate({ data: doc.data }, doc, {
      upsert: true,
    })
      .then()
      .catch((err) => {
        console.log(err);

        return false;
      });
  });
  return;
}

async function todosOsCardapioSer(next) {
  const rs = await CardapioSer.find().clone();
  return next(rs);
}

async function findCardapioByDateSer(data, next) {
  const cardapio = await CardapioSer.findOne({ data: data });
  return next(cardapio);
}

/**
 * Retrieve all user tokens and pass them to the provided callback function.
 *
 * @param {Function} next - The callback function to receive the user tokens.
 * @returns {Promise<void>} A promise that resolves with the result of the callback function.
 *
 * @description
 * This function retrieves all user tokens from the `UsersTokensSer` collection and passes them to the provided callback function using the `next` parameter. The user tokens are obtained by querying the collection and iterating over the result to extract the tokens. The result of the callback function is returned as a promise.
 */
async function getAllUsersTokensSer(next) {
  allTokens = [];
  const rs = await UsersTokensSer.find().clone();
  rs.forEach((tk) => allTokens.push(tk.token));
  // console.log(allTokens);
  return next(allTokens);
}

async function dropCollectionSer(next) {
  await CardapioSer.collection
    .drop()
    .then((e) => next(true))
    .catch((err) => {
      console.error(err);
      return next(false);
    });
}

module.exports = {
  postCardapioSer,
  todosOsCardapioSer,
  findCardapioByDateSer,
  updateCardapioSer,
  dropCollectionSer,
  getAllUsersTokensSer,
};
