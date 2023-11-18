require("dotenv");
const FCM = require("fcm-node");
const { getAllUsersTokensSer } = require("../databases/querysSer");

const serverKey = process.env.SERVERKEY;

const fcm = new FCM(serverKey);

// get all users tokens
/**
 * Notifies the user about changes in the menu for today's meals.
 *
 * @param {Object} options - The options for the notification.
 * @param {Object} options.almoco - The information about changes in the lunch menu.
 * @param {boolean} options.almoco.isAlmocoNeed - Indicates if changes in the lunch menu are needed.
 * @param {string} options.almoco.oldAlmoco - The previous lunch menu.
 * @param {string} options.almoco.newAlmoco - The updated lunch menu.
 * @param {Object} options.jantar - The information about changes in the dinner menu.
 * @param {boolean} options.jantar.isJantarNeed - Indicates if changes in the dinner menu are needed.
 * @param {string} options.jantar.oldJantar - The previous dinner menu.
 * @param {string} options.jantar.newJantar - The updated dinner menu.
 * @returns {Promise<void>} - A promise that resolves when the notification is sent.
 */
async function notifyUserCardapioDeHojeMudou({ almoco, jantar }) {
  const userToken = await getAllUsersTokensSer((d) => d);
  console.log("---------------------\n Notification \n---------------------");

  // console.log(userToken);
  console.log(almoco, jantar);
  if (almoco.isAlmocoNeed && jantar.isJantarNeed) {
    const message = {
      registration_ids: userToken,
      notification: {
        title: "Alteração no cardápio",
        body: "Cardápio do almoço e jantar foram alterados.",
        channelId: "ru_digital",
        channel_id: "ru_digital",
      },
    };
    sendNotification(message);
  } else if (almoco.isAlmocoNeed) {
    // console.log("info:almoco");
    const message = {
      registration_ids: userToken,
      notification: {
        title: "Cardápio do almoço foi alterado.",
        body: "De " + almoco.oldAlmoco + " para " + almoco.newAlmoco,
        channel_id: "ru_digital",
        channelId: "ru_digital",
      },
    };
    sendNotification(message);
  } else if (jantar.isJantarNeed) {
    // console.log("info: jantar");
    const message = {
      registration_ids: userToken,
      notification: {
        title: "Cardápio do jantar foi alterado.",
        body: "De " + jantar.oldJantar + " para " + jantar.newJantar,
        channelId: "ru_digital",
        channel_id: "ru_digital",
        // android_channel_id: "your_channel_id",
      },
      // data: { route: "TodoCardapioScreen" },
    };
    sendNotification(message);
  }
}

//if we have new cardapio for the week.
/**
 * Generates and sends a notification to all registered users about the availability of a new menu for the week.
 *
 * @returns {Promise<void>} - A promise that resolves when the notification is sent.
 */
async function novoCardapioDaSemana() {
  // get user token
  const userToken = await getAllUsersTokensSer((d) => d);
  console.log("---------- Notify novo cardapio ----------");
  const message = {
    registration_ids: userToken,
    notification: {
      title: "Novo cardápio da semana",
      body: "Olá! O cardápio desta semana já está disponível.",
      channelId: "ru_digital",
      channel_id: "ru_digital",
    },
  };
  // to send notification to all registered users.
  sendNotification(message);
}

/**
 * Notify the users about the menu of the day.
 *
 * @param {Object} param - The menu object for the day.
 * @param {Object} param.almoco - The lunch menu object.
 * @param {boolean} param.almoco.isAlmoco - Indicates if there is a lunch menu for the day.
 * @param {string} param.almoco.refei - The lunch menu for the day.
 * @param {Object} param.jantar - The dinner menu object.
 * @param {boolean} param.jantar.isJantar - Indicates if there is a dinner menu for the day.
 * @param {string} param.jantar.refei - The dinner menu for the day.
 * @returns {Promise<void>} A promise that resolves once the users are notified.
 *
 * @description
 * This function retrieves the user tokens using the `getAllUsersTokensSer` function and sends notifications to the users about the menu of the day. If there is a lunch menu, a notification with the title "Almoço do dia" and the lunch menu body is sent. If there is a dinner menu, a notification with the title "Jantar do dia" and the dinner menu body is sent. The notifications are sent using the `sendNotification` function.
 */
async function cardapioDoDia({ almoco, jantar }) {
  // console.log(almoco)
  // get user token
  const userToken = await getAllUsersTokensSer((d) => d);
  console.log("---------- Notify do dia cardapio ----------");

  if (almoco.isAlmoco) {
    const message = {
      registration_ids: userToken,
      notification: {
        title: "Almoço do dia",
        body: almoco.refei,
        channelId: "ru_digital",
        channel_id: "ru_digital",
      },
    };
    sendNotification(message);
  }
  if (jantar.isJantar) {
    const message = {
      registration_ids: userToken,
      notification: {
        title: "Jantar do dia",
        body: jantar.refei,
        channelId: "ru_digital",
        channel_id: "ru_digital",
      },
    };
    sendNotification(message);
  }

  // to send notification to all registered users.
}


/**
 * Send a notification using the provided message.
 *
 * @param {Object} message - The notification message to be sent.
 * @returns {Promise<void>} A promise that resolves once the notification is sent.
 *
 * @description
 * This function sends a notification using the provided message object. The notification is sent using the `fcm.send` function. If an error occurs during the sending process, the error message and response are logged to the console.
 */
async function sendNotification(message) {
  await fcm.send(message, (err, response) => {
    if (err) {
      console.log("Something has gone wrong!" + err.failure);
      console.log("Respponse:! " + response);
    }
  });
}

module.exports = {
  notifyUserCardapioDeHojeMudou,
  novoCardapioDaSemana,
  cardapioDoDia,
};
