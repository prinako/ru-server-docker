const {
  CardapioH,
  CardapioSer,
  UsersTokensH,
  UsersTokensSer,
} = require("./schema");

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

async function postCardapio(dados, next) {
  formatCardapioFroDatabase(dados, async (novoCadapio) => {
    const d = new CardapioH(novoCadapio);
    await d
      .save()
      .then(async (resolute) => {
        await connectMongoDBserver(d);
        next(resolute);
      })
      .catch((err) => next(err.keyValue));
  });
}

async function connectMongoDBserver(dados) {
  console.log(`we wii connect soon: ` + dados);
}

async function updateCardapio(dados) {
  formatCardapioFroDatabase(dados, async (novoCadapio) => {
    await CardapioH.findOneAndUpdate({ data: dados.dia[1] }, novoCadapio, {
      upsert: true,
    })
      .then()
      .catch((err, duc) => {
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

async function todosOsCardapio(next) {
  const rs = await CardapioH.find().clone();
  return next(rs);
}

async function findCardapioByDate(data, next) {
  const cardapio = await CardapioH.findOne({ data: data });
  return next(cardapio);
}

async function getAllUsersTokens(next) {
  allTokens = [];
  const rs = await UsersTokensH.find().clone();
  rs.forEach((tk) => allTokens.push(tk.token));
  // console.log(allTokens);
  return next(allTokens);
}

async function dropCollection(next) {
  // verify collection if new cardápio has ben added or not.
  const toBeVerified = await todosOsCardpio((e) => e);
  // const isToBeDrop = toBeVerified.length;
  // console.log(isToBeDrop);

  await CardapioH.collection
    .drop()
    .then((e) => next(true))
    .catch((err) => {
      console.error(err);
      return next(false);
    });

}

async function getCardapioFormatToVerify(dados, next) {
  await formatCardapioFroDatabase(dados, (cardapioFormatado) => {
    return next(cardapioFormatado);
  });
}


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
