import "dotenv/config";
import { createTransport } from "nodemailer";

const send = (toEmail) => {
  console.log("Envoi d'email à l'adresse : " + toEmail);
  const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.TRANSP_USER,
      pass: process.env.SMTP_KEY,
    },
  });

  const mailOptions = {
    from: process.env.TRANSP_USER,
    to: toEmail,
    subject: "Contact Tako Dev",
    text: "Merci d'avoir contacter Tako Dev ",
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
