// Importe a função isEqual da biblioteca lodash e
// a função findCardapioByDate de um módulo de banco de dados.
const isEqual = require("lodash/isEqual");

/**
 * Compares the old and new cardapio data and determines if a notification is needed.
 *
 * @param {Object} oldCardapio - The old cardapio data retrieved from the database.
 * @param {Object} newCardapio - The new cardapio data retrieved from the ru site.
 * @param {Function} next - The callback function to be called with the comparison results.
 * @return {Promise<void>} A promise that resolves when the comparison is complete.
 */
async function isItNeedToNotify(oldCardapio, newCardapio, next) {

  let isAlmoco;
  let isJantar;

  // Check if newCardapio is not null.
  if (oldCardapio == null && newCardapio == null) {
    return next({ 
      isAlmocoNeed: false,
      isJantarNeed: false, // Indicates that nothing needs to be done for the jantar.
    });
  }

  isAlmoco = isEqual(
    oldCardapio.almoco.nomeDaRefeicao,
    newCardapio.almoco[0]
  );

  // Compare the nomeDaRefei property of the jantar in oldCardapio and newCardapio.
  isJantar = isEqual(
    oldCardapio.jantar.nomeDaRefeicao,
    newCardapio.jantar[0]
  );
  // console.log(isJantar);

  // Declare variables to store information about the almoco and jantar.
  let almoco;
  let jantar;

  // Check if something needs to be done for the almoco.
  if (!isAlmoco) {
    // If it is necessary to do something for the almoco, get the old and new cardapio names.
    const old =  oldCardapio.almoco.nomeDaRefeicao
    const novo = newCardapio.almoco[0]

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
    const old =  oldCardapio.jantar.nomeDaRefeicao
    const novo = newCardapio.jantar[0]

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


// Exporte a função isItNeedToNotify para uso em outros módulos.
module.exports = isItNeedToNotify ;
