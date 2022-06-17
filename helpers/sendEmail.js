const nodemailer = require("nodemailer")
const dotenv = require("dotenv").config();

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((err, success) => {
    if (err) console.error(err);
    console.log('Your config is correct');
    });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.emailhtml,
    text: options.emailtext,
  };

  transporter.sendMail(mailOptions,  (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;