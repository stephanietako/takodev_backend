import "dotenv/config";
import { createTransport } from "nodemailer";

const send = (toEmail) => {
  console.log("Envoi d'email à l'adresse : " + toEmail);
  const transporter = createTransport({
    host: process.env.HOST,
    port: process.env.PORT_SMTP,
    auth: {
      user: process.env.TRANSP_USER,
      pass: process.env.SMTP_KEY,
    },
  });

  const mailOptions = {
    from: process.env.TRANSP_USER,
    to: toEmail,
    subject: "Contact Tako Dev",
    text: "Bonjour, merci d'avoir contacté Tako Dev !\n Nous vous tiendrons au courant des newsletters et promotions en cours. A très bientôt",
  };
  console.log(mailOptions);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("E-mail envoyé : " + info.response);
    }
  });
};

export default send;
