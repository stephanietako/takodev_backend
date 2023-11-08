import express from "express";
import cors from "cors";
import "dotenv/config";
import { validateForm } from "./validator.js";
import helmet from "helmet";
import Joi from "joi";
import Brevo from "@getbrevo/brevo";
import { send, sendEmail } from "./mailing.js";

const app = express();
let apiInstance;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Fonction pour configurer l'API Brevo
const setUpBrevo = () => {
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
const sendContactviaBrevo = async (toEmail, form, listId, res) => {
  try {
    const attributesToAdd = [
      { name: "PRENOM", value: form.firstname },
      { name: "NOM", value: form.lastname },
      { name: "EMAIL", value: form.email },
      { name: "MESSAGE", value: form.message },
    ];
    // Création d'un objet pour stocker les arttributs
    const attributesObject = {};

    attributesToAdd.forEach((attribute) => {
      attributesObject[attribute.name] = attribute.value;
    });

    const createContact = {
      email: toEmail,
      listIds: [listId],
      emailBlacklisted: false,
      smsBlacklisted: false,
      updateEnabled: false,
      attributes: attributesObject,
    };

    const data = await apiInstance.createContact(createContact);
    res.json(data); // Réponse au client ici
    console.log("DATA DANS APIINSTANCE DE CONACT", data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An error occurred." });
  }
};

// mail
app.post("/email", async (req, res) => {
  const { email } = req.body;
  if (!Joi.string().email().validate(email).error === null) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const userEmail = req.body.email;
  console.log("Adresse e-mail de l'utilisateur : " + userEmail);

  setUpBrevo();
  send(req.body.email);
  sendEmailviaBrevo(userEmail, 4, res);
});

// contact
app.post("/contact", async (req, res) => {
  try {
    const { error, value } = validateForm(req.body);

    if (error) {
      throw new Error("Error! Status: error");
    }
  } catch (err) {
    console.error("Une erreur est survenue :", err.message);
    res.status(400).json({ error: err.message });
    return;
  }

  const emailContact = req.body.email;
  const form = req.body;

  // Supprime les espaces indésirables de l'e-mail de contact
  const cleanedEmailContact = emailContact.trim();

  const userEmail = req.body;

  if (!userEmail) {
    res.status(400).json({ error: "userEmail is required." });
    return;
  }
  setUpBrevo();
  send(cleanedEmailContact, userEmail);
  sendContactviaBrevo(cleanedEmailContact, form, 3, res);
  // Envoie une copie de l'e-mail de l'utilisateur
  const copySubject = "Copie de l'e-mail de l'utilisateur";
  const copyText = `Contenu de la copie\nE-mail de l'utilisateur : ${form.email}, Contenu de la copie\ndu nom et prenom de l'utilisateur ${form.lastname}, ${form.firstname}, Contenu de la copie\ndu message de l'utilisateur ${form.message}  `;
  sendEmail(process.env.TRANSP_USER, copySubject, copyText);
});

app.get("/", (req, res) => {
  res.send("Welcome to the Tako Dev backend. Follow the white rabbit.");
});

app.listen(process.env.PORT, () =>
  console.log(`Application started on port: ${process.env.PORT}`)
);
