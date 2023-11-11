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
  console.log(almoco, jantar)
  if ((almoco.isAlmocoNeed && jantar.isJantarNeed)) {
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
  console.log('---------- Notify novo cardapio ----------');
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
 * Sends a notification using the Firebase Cloud Messaging service.
 *
 * @param {string} message - The message to be sent.
 * @returns {Promise<void>} - A promise that resolves when the notification is sent successfully.
 */
async function sendNotification(message) {
  await fcm.send(message, (err, response) => {
    if (err) {
      console.log("Something has gone wrong!" + err.failure);
      console.log("Respponse:! " + response);
    }
  });
}

module.exports = { notifyUserCardapioDeHojeMudou, novoCardapioDaSemana };
