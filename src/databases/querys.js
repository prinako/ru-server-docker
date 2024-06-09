
const { Cardapio, UsersTokens, News } = require("./schema");

/**
 * Posts cardápio (menu) data to the database and invokes a callback function.
 * 
 * @async
 * @param {Object} dados - The cardápio data.
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is posted.
 */
async function postCardapio(menu, next) {
  const newData = [];
  menu.forEach(async (dados) => {
    const novoCadapio = new Cardapio({
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
    });
    newData.push(novoCadapio);

  });
  try {
    await Cardapio.insertMany(newData);
    return next(true);
  } catch (error) {
    // console.log(error);
    return next(false);
  }
}

/**
 * Retrieves all cardápio (menu) data and invokes a callback function with the result.
 * 
 * @async
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves with all cardápio data.
 */
async function todosOsCardapio(next) {
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
 * Updates the cardápio (menu) data in the database and invokes a callback function.
 * 
 * @async
 * @param {Object} dados - The cardápio data.
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is updated.
 */
async function updateCardapio(dados, next) {
  const toUpdate = {
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
  // console.log(toUpdate);
  await Cardapio.findOneAndUpdate(
    { data: dados.dia[1] },
    toUpdate,
    { upsert: true },
    (err, duc) => {
      if (err) {
        console.log(err);
        return false;
      }
      return true;
    }
  ).clone();
  return;
  //return next(duc);
}

async function updateByDateCardapio(date, dado, next) {
  const dados = dado[0];

  const toUpdate = {
    dia: dados.dia,
    data: dados.data,
    amoco: {
      refeicao: "ALMOÇO",
      nomeDaRefei: dados.almoco_nomeDaRefei,
      ingredintes: {
        amo1: dados.almoco_amo1,
        amo2: dados.almoco_amo2,
        amo3: dados.almoco_amo3,
        amo4: dados.almoco_amo4,
        amo5: dados.almoco_amo5,
      },
      vegetariano1: dados.almoco_vegetariano,
    },
    jantar: {
      refeicao: "JANTAR",
      nomeDaRefei: dados.jantar_nomeDaRefei,
      ingredintes: {
        jan1: dados.jantar_jan1,
        jan2: dados.jantar_jan2,
        jan3: dados.jantar_jan3,
        jan4: dados.jantar_jan4,
        jan5: dados.jantar_jan5,
      },
      vegetariano2: dados.jantar_vegetariano,
    },
  };

  // console.log(toUpdate);
  await Cardapio.findOneAndUpdate(
    { data: date },
    toUpdate,
    { upsert: true },
  ).clone();
  return next(true);
  //return next(duc);
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
    await isToken.save((err, duc) => {
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
  const toBeVerified = await todosOsCardapio((e) => e);
  const isToBeDrop = toBeVerified.length;

  // console.log(isToBeDrop);

  if (isToBeDrop > 6) {
    // notify all users
    //  await novoCardapioDaSemana();
    // drop collection
    await Cardapio.collection
      .drop()
      .then((e) => next(true))
      .catch((err) => console.error(err));
  } else {
    return next(false);
  }
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
  todosOsCardapio,
  findCardapioByDate,
  updateCardapio,
  dropCollection,
  postUsersTokens,
  getAllUsersTokens,
  postNews,
  getNews,
  updateByDateCardapio,
};
