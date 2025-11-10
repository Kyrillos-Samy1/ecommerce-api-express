const nodemailer = require("nodemailer");
require("dotenv").config();
// const path = require("path");

const sendEmail = async (options, html) => {
  //! Create Transporter Service That Will Send E-mail Like ("gmail", "mailGun", "mailTrap", "sendGrid")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS
    }
  });

  //! Define Email Options like ("From", "To", "Subject", "HTMLFormat")
  const mailOptions = {
    from: `"FastCart" <${options.from}>`,
    to: options.email,
    subject: options.subject,
    html,
    // attachments: [
    //   {
    //     filename: "Kyrillos_Samy_LinkedIn.png",
    //     path: path.join(__dirname, "images", "Kyrillos_Samy_LinkedIn.png"),
    //     cid: "userphoto"
    //   }
    // ]
  };

  //! Send Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
