import express from "express";
import cors from "cors";
import "dotenv/config";
import { validateForm } from "./validator.js";
import helmet from "helmet";
import SibApiV3Sdk from "sib-api-v3-sdk";
import send from "./mailing.js";

const app = express();
let apiInstance;

app.use(helmet());
app.use(cors());
app.use(express.json());

const corsOptions = {
  origin: "https://www.takodev.studio", // Remplacez par l'URL de votre site en production
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));

// Fonction pour configurer l'API Brevo
const setUpBrevo = () => {
  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.API_KEY;

  apiInstance = new SibApiV3Sdk.ContactsApi();
};

// Fonction pour stocker des datas de contact d'utilisateur dans Brevo
const sendEmailviaBrevo = async (toEmail, listId, res) => {
  const createContact = {
    email: toEmail,
    listIds: [listId],
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
};

// mail
app.post("/email", async (req, res) => {
  console.log("Requête POST /email reçue.");
  // validate email a ajouter
  const userEmail = req.body.email;
  console.log("Adresse e-mail de l'utilisateur : " + userEmail);

  setUpBrevo();
  sendEmailviaBrevo(userEmail, 4, res);
  send(req.body.email);
});

// contact
app.post("/contact", async (req, res) => {
  const { error, value } = validateForm(req.body);
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent." });
  }

  const { firstname, lastname, email, message } = req.body;
  console.log("Data de l'utilisateur : " + firstname, lastname, email, message);
  setUpBrevo();

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
