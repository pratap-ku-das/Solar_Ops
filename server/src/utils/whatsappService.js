// WhatsApp notification service using Twilio API
// You need to set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in your .env

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

const sendWhatsApp = async ({ to, message }) => {
  if (!client || !whatsappFrom) {
    console.log(`📱 WhatsApp (demo) to ${to}: ${message}`);
    return { demo: true };
  }
  return client.messages.create({
    from: whatsappFrom,
    to: `whatsapp:${to}`,
    body: message
  });
};

module.exports = { sendWhatsApp };