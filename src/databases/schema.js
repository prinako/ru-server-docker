const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema para creiaar cardapio.
const cadapioSchema = new Schema(
  {
    dia: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      require: true,
      unique: true,
    },
    amoco: {
      refeicao: {
        type: String,
        require: true,
      },
      nomeDaRefei: {
        type: String,
      },
      ingredintes: {
        amo1: {
          type: String,
        },
        amo2: {
          type: String,
        },
        amo3: {
          type: String,
        },
        amo4: {
          type: String,
        },
        amo5: {
          type: String,
        },
      },
      vegetariano1: {
        type: String,
      },
    },
    jantar: {
      refeicao: {
        type: String,
        require: true,
      },
      nomeDaRefei: {
        type: String,
      },
      ingredintes: {
        jan1: {
          type: String,
        },
        jan2: {
          type: String,
        },
        jan3: {
          type: String,
        },
        jan4: {
          type: String,
        },
        jan5: {
          type: String,
        },
      },
      vegetariano2: {
        type: String,
      },
    },
  }
  // {
  //   timestamps: true,
  // }
);

const postUsersTokens = new Schema(
  {
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const postNews = new Schema(
  {
    imageUrl: {
      type: String,
    },
    msg: {
      type: String,
    },
    isImage:{
      type: Boolean,
    },
    title:{
      type:String,
    },
    textColor:{
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Cardapio = mongoose.model("cadapio", cadapioSchema);
const UsersTokens = mongoose.model("tokens", postUsersTokens);
const News = mongoose.model("news", postNews);

//exportar o modolar
module.exports = {
  Cardapio,
  UsersTokens,
  News,
};
