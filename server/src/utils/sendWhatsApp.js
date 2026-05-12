const axios = require("axios");

const sendWhatsApp = async (
  phone,
  message
) => {

  try {

    await axios.post(

      "https://api.ultramsg.com/instance173666/messages/chat",

      {

        token: "wv7y3s3b9u9dungj",

        to: `91${phone}`,

        body: message

      }

    );

    console.log("WhatsApp Sent");

  } catch (error) {

    console.log(
      error.response?.data || error
    );

  }

};

module.exports = sendWhatsApp;