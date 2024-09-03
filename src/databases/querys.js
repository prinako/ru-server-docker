
const { Cardapio, UsersTokens, News } = require("./schema");

/**
 * Posts cardápio (menu) data to the database and invokes a callback function.
 * 
 * @param {Array} newCardapio - The array of cardápio data to be inserted.
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is posted.
 */
async function postCardapio(newCardapio, next) {
  // Array to store the new cardápio data
  let newData = [];

  // Iterate over each item in the newCardapio array
  for (const dados of newCardapio) {
    // Create a new Cardapio object for each item
    const novoCadapio = new Cardapio({
      dia: dados.dia[0], // Day of the week
      data: dados.dia[1], // Date of the cardápio
      almoco: { // Lunch menu
        refeicao: "ALMOÇO", // Type of meal
        nomeDaRefeicao: dados.almoco[0], // Name of the lunch menu
        acompanhamento: { // Side dishes
          amo1: dados.almoco[3],
          amo2: dados.almoco[4],
          amo3: dados.almoco[5],
          amo4: dados.almoco[6],
          amo5: dados.almoco[7],
        },
        vegetarianoAlmoco: dados.almoco[2], // Vegetarian option for lunch
      },
      jantar: { // Dinner menu
        refeicao: "JANTAR", // Type of meal
        nomeDaRefeicao: dados.jantar[0], // Name of the dinner menu
        acompanhamento: { // Side dishes
          jan1: dados.jantar[3],
          jan2: dados.jantar[4],
          jan3: dados.jantar[5],
          jan4: dados.jantar[6],
          jan5: dados.jantar[7],
        },
        vegetarianoJantar: dados.jantar[2], // Vegetarian option for dinner
      },
    });
    // Add the new cardápio object to the newData array
    newData.push(novoCadapio);
  }

  try {
    // Insert the new cardápio data into the database
    await Cardapio.insertMany(newData);
    return next(true);
  } catch (error) {
    console.error(error);
    // If an error occurs, invoke the callback function with false
    return next(false);
  }
}

/**
 * Retrieves all cardápio (menu) data and invokes a callback function with the result.
 * 
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves with all cardápio data.
 */
async function getAllCardapioFromDB(next) {
  const rs = await Cardapio.find().clone();
  return next(rs);
}

/**
 * Finds a cardápio (menu) by date and invokes a callback function with the result.
 * 
 * @async
 * @param {string} data - The date to search for.
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves with the found cardápio.
 */
async function findCardapioByDate(data, next) {
  const cardapio = await Cardapio.findOne({ data: data });
  return next(cardapio);
}



/**
 * Finds a cardápio (menu) by date and updates the cardápio data with the given dados.
 * 
 * @async
 * @param {Object} cadapioUpdate - The cardápio data to update.
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is updated.
 */
async function findOneCardapioByDateAndupdate(cadapioUpdate, next) {
  // Construct the update object
  const toUpdate = {
    dia: cadapioUpdate.dia[0], // The day of the week
    data: cadapioUpdate.dia[1], // The date of the menu
    almoco: { // Lunch menu
      refeicao: "ALMOÇO", // Type of meal
      nomeDaRefeicao: cadapioUpdate.almoco[0], // Name of the lunch menu
      acompanhamento: { // Side dishes
        amo1: cadapioUpdate.almoco[3],
        amo2: cadapioUpdate.almoco[4],
        amo3: cadapioUpdate.almoco[5],
        amo4: cadapioUpdate.almoco[6],
        amo5: cadapioUpdate.almoco[7],
      },
      vegetarianoAlmoco: cadapioUpdate.almoco[2], // Vegetarian option for lunch
    },
    jantar: { // Dinner menu
      refeicao: "JANTAR", // Type of meal
      nomeDaRefeicao: cadapioUpdate.jantar[0], // Name of the dinner menu
      acompanhamento: { // Side dishes
        jan1: cadapioUpdate.jantar[3],
        jan2: cadapioUpdate.jantar[4],
        jan3: cadapioUpdate.jantar[5],
        jan4: cadapioUpdate.jantar[6],
        jan5: cadapioUpdate.jantar[7],
      },
      vegetarianoJantar: cadapioUpdate.jantar[2], // Vegetarian option for dinner
    },
  };

  // Find and update the cardápio by date
 const result = await Cardapio.findOneAndUpdate(
    { data: cadapioUpdate.dia[1] }, // The date to search for
    toUpdate, // The update object
    { upsert: true, new: true, includeResultMetadatas: true }, // Create a new document if the date doesn't exist
  );

  // Return the result of the update operation
  return next();
}


/**
 * Posts a user's token.
 * 
 * @async
 * @param {Object} req - The request object.
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the token is posted.
 */
async function postUsersTokens(req, next) {
  const token = req.body;
  const isOkToInsect = await UsersTokens.findOne(token);

  if (isOkToInsect == null) {
    const isToken = new UsersTokens(token);
    await isToken.save().then((err, duc) => {
      if (err) {
        return next(false);
      } else {
        // console.log(duc);
        return next(true);
      }
    });
  }
  return next("exiting");
}

/**
 * Retrieves all users' tokens.
 * 
 * @async
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves with an array of all tokens.
 */
async function getAllUsersTokens(next) {
  allTokens = [];
  const rs = await UsersTokens.find().clone();
  rs.forEach((tk) => allTokens.push(tk.token));
  // console.log(allTokens);
  return next(allTokens);
}

/**
 * Drops a collection if a certain condition is met.
 * 
 * @async
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the collection is dropped.
 */
async function dropCollection(next) {
  // verify collection if new cardápio has ben added or not.
  const toBeVerified = await getAllCardapioFromDB((e) => e);

  // drop collection
  await Cardapio.collection
    .drop()
    .then((e) =>next(e))
    .catch((err) => console.error(err));
}

/**
 * Posts a new news article.
 * 
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the news article is posted.
 */
async function postNews(req, res) {
  // console.log(req.body);
  const { imageUrl, msg, isImage, title, textColor } = req.body;
  const newNews = new News({
    title: title,
    imageUrl: imageUrl,
    msg: msg,
    isImage: isImage,
    textColor: textColor,
  });
  try {
    await newNews.save().then((doc) => {
      // console.log(e);
      return res.status(200).json({ msg: "ok" })
    })
  } catch (err) {
    console.log(err);
    return res.status(404).json({ msg: "cant post new News" });
  }
}

/**
 * Retrieves all news articles and invokes a callback function with the result.
 * 
 * @async
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves with all news articles.
 */
async function getNews(next) {
  const res = await News.find().clone();
  return next(res);
}

module.exports = {
  postCardapio,
  getAllCardapioFromDB,
  findCardapioByDate,
  findOneCardapioByDateAndupdate,
  dropCollection,
  postUsersTokens,
  getAllUsersTokens,
  postNews,
  getNews,
};
