import express from "express";
import cors from "cors";
import "dotenv/config";
import fetch from "node-fetch";
import { validateForm } from "./validator.js";
import { createTransport } from "nodemailer";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to the Tako Dev backend. Follow the white rabbit.");
});

// Ici c'est pour l'envoi de mail aux utilisateurs
app.post("/send-mail", async (req, res) => {
  const { error, value } = req.body.mail;
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent send email." });
  }
  res.json({ success: true });
  const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.TRANSP_USER,
      pass: process.env.SMTP_KEY,
    },
  });

  transporter.verify(async (err, success) => {
    if (err) {
      console.error(err);
      return res.json({ success: false });
    }

    const mailOptions = {
      from: process.env.TRANSP_USER,
      to: req.body.email,
      subject: "Contact Response from Tako Dev",
      text: "Thank you for contacting Tako Dev! We hope to answer all your questions.",
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error, "erreur dans le transporteur de sendmail");
      return res.json({ success: false });
    }
  });
});

// Ici c'est pour l'envoi de sinput du formulaire sur Brevo
const apiKey = process.env.API_KEY;
app.post("/contact", async (req, res) => {
  console.log("req.body", req.body);
  const { error, value } = validateForm(req.body);
  console.log("req.body.name", req.body.name);
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent contact form." });
  }

  // const { name, lastname, email, message } = req.body;
  const contact = {
    name: req.body.name,
    lastname: req.body.lastname,
    email: req.body.email,
    message: req.body.message,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Application started on port: ${process.env.PORT}`)
);
