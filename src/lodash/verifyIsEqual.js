// Importe a função isEqual da biblioteca lodash e
// a função findCardapioByDate de um módulo de banco de dados.
const isEqual = require("lodash/isEqual");
const { findCardapioByDate } = require("../databases/querys");


/**
 * Compares the old and new cardapio data and determines if a notification is needed.
 *
 * @param {Object} oldCardapio - The old cardapio data retrieved from the database.
 * @param {Object} newCardapio - The new cardapio data retrieved from the ru site.
 * @param {Function} next - The callback function to be called with the comparison results.
 * @return {Promise<void>} A promise that resolves when the comparison is complete.
 */
async function isItNeedToNotify(oldCardapio, newCardapio, next) {
  // Check if oldCardapio is not null.
  if (oldCardapio != null && newCardapio != null) {

    // Compare the nomeDaRefei property of the amoco in oldCardapio and newCardapio.
    const isAlmoco = isEqual(
      oldCardapio[0].amoco_nomeDaRefei,
      newCardapio[0].amoco_nomeDaRefei
    );

    // Compare the nomeDaRefei property of the jantar in oldCardapio and newCardapio.
    const isJantar = isEqual(
      oldCardapio[0].jantar_nomeDaRefei,
      newCardapio[0].jantar_nomeDaRefei
    );

    // Declare variables to store information about the almoco and jantar.
    let almoco;
    let jantar;

    // Check if something needs to be done for the almoco.
    if (!isAlmoco) {
      // If it is necessary to do something for the almoco, get the old and new cardapio names.
      const old =  oldCardapio[0].amoco_nomeDaRefei;
      const novo = newCardapio[0].amoco_nomeDaRefei;

      // Create the almoco object with information about the almoco.
      almoco = {
        isAlmocoNeed: true, // Indicates that something needs to be done for the almoco.
        oldAlmoco: old, // Old cardapio name.
        newAlmoco: novo, // New cardapio name.
      };
    } else {
      // If nothing needs to be done for the almoco, create an almoco object with isAlmocoNeed set to false.
      almoco = {
        isAlmocoNeed: false, // Indicates that nothing needs to be done for the almoco.
      };
    }

    // Repeat the same process for the jantar.
    if (!isJantar) {
      const old = oldCardapio[0].jantar_nomeDaRefei;
      const novo = newCardapio[0].jantar_nomeDaRefei;

      jantar = {
        isJantarNeed: true, // Indicates that something needs to be done for the jantar.
        oldJantar: old, // Old meal name.
        newJantar: novo, // New meal name.
      };
    } else {
      jantar = {
        isJantarNeed: false, // Indicates that nothing needs to be done for the jantar.
      };
    }

    // Return an object with the results of the three comparisons (almoco, jantar, nomeDaRefei)
    // to the next function.
    return next({ almoco, jantar });
  }
}

/**
 * Compares two sets of data and returns a boolean indicating if they are equal.
 *
 * @param {Object} dataFromDB - The data retrieved from the database.
 * @param {Object} dataFromRuSite - The data retrieved from the ru site.
 * @return {Promise<boolean>} A boolean indicating if the data is equal.
 */
async function isDataEqual(dataFromDB, dataFromRuSite) {
  // Use the lodash isEqual function to compare the two sets of data.
  return isEqual(dataFromDB, dataFromRuSite);
}

// Exporte a função isItNeedToNotify para uso em outros módulos.
module.exports = { isItNeedToNotify, isDataEqual };
