const nodemailer = require("nodemailer");

const sendReminderEmail = async ({ to, subject, text }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`📧 Demo email to ${to}: ${subject}`);
    return { demo: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@solar.com",
    to,
    subject,
    text
  });
};

module.exports = { sendReminderEmail };
