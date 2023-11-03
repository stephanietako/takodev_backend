import express from "express";
import cors from "cors";
import "dotenv/config";
import { validateForm } from "./validator.js";
import helmet from "helmet";
import Joi from "joi";
import Brevo from "@getbrevo/brevo";
import send from "./mailing.js";

const app = express();
let apiInstance;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Fonction pour configurer l'API Brevo
const setUpBrevo = (toEmail, listId) => {
  let defaultClient = Brevo.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.API_KEY;

  let api = new Brevo.AccountApi();
  api.getAccount().then(
    (data) => {
      console.log("API called successfully. Returned data", data);
    },
    (error) => {
      console.error(error);
    }
  );

  apiInstance = new Brevo.ContactsApi();
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

/// Fonction pour stocker des datas de contact des utilisateurs avec ses attributs dans Brevo
const sendContactviaBrevo = async (Form, listId, res) => {
  // création d'un tableau d'attributs
  const attributesToAdd = [
    { name: "PRENOM", value: Form.firstname },
    { name: "NOM", value: Form.lastname },
    { name: "MESSAGE", value: Form.message },
  ];
  // Création d'un objet pour stocker les arttributs
  const attributesObject = {};

  attributesToAdd.forEach((attribute) => {
    attributesObject[attribute.name] = attribute.value;
  });

  const createContact = {
    email: Form.email,
    attributes: attributesObject,
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
  const { error, value } = req.body;
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent." });
  }
  const { email } = req.body;
  if (!Joi.string().email().validate(email).error === null) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const userEmail = req.body.email;
  console.log("Adresse e-mail de l'utilisateur : " + userEmail);

  setUpBrevo(userEmail, 4);

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

  const userForm = req.body;

  setUpBrevo(req.body.email, 4);

  sendContactviaBrevo(userForm, 3, res);
});

app.get("/", (req, res) => {
  res.send("Welcome to the Tako Dev backend. Follow the white rabbit.");
});

app.listen(process.env.PORT, () =>
  console.log(`Application started on port: ${process.env.PORT}`)
);
