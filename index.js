import express from "express";
import cors from "cors";
import "dotenv/config";
import fetch from "node-fetch";
import { validateForm } from "./validator.js";
import helmet from "helmet";
import SibApiV3Sdk from "sib-api-v3-sdk";
import send from "./mailing.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Fonction pour configurer l'API Brevo
const setUpBrevo = () => {
  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.API_KEY;
};

// Fonction pour stocker des datas de contact d'utilisateur dans Brevo
const sendEmailviaBrevo = async (toEmail, listId, res) => {
  setUpBrevo();

  const apiInstance = new SibApiV3Sdk.ContactsApi();
  const createContact = {
    email: toEmail,
    listIds: [listId],
    emailBlacklisted: false,
    smsBlacklisted: false,
    updateEnabled: false,
  };
  console.log(
    "Paramètres pour l'appel à l'API : " + JSON.stringify(createContact)
  );
  try {
    await apiInstance.createContact(createContact);
    console.log("E-mail envoyé avec succès via Brevo");
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail avec Brevo : " + error);
    console.error(error);
    res.json({ success: false });
  }
};

app.post("/email", async (req, res) => {
  console.log("Requête POST /email reçue.");

  const { error, value } = req.body.email;
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent send email." });
  }

  try {
    const emailSent = send(req.body.email);

    if (emailSent) {
      sendEmailviaBrevo(req.body.email, 4, res);
      return res.status(200).json({ success: true });
    } else {
      return res.status(403).json({ error: "Failed to send email." });
    }
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
});

app.post("/contact", async (req, res) => {
  const { error, value } = validateForm(req.body);
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent ." });
  }

  const { firstname, lastname, email, message } = req.body;

  apiBrevo();

  const apiInstance = new SibApiV3Sdk.ContactsApi();
  const createContact = {
    email,
    attributes: {
      MESSAGE: message,
      PRENOM: firstname,
      NOM: lastname,
    },
    listIds: [3],
    emailBlacklisted: false,
    smsBlacklisted: false,
    updateEnabled: false,
  };

  try {
    await apiInstance.createContact(createContact);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Tako Dev backend. Follow the white rabbit.");
});

app.listen(process.env.PORT, () =>
  console.log(`Application started on port: ${process.env.PORT}`)
);
