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
  console.log("LISTID SENDEMAIL", listId);
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
    // USERMAIL !!!!!!:  dohes72608@mainmile.com
    console.log("USERMAIL !!!!!!:", toEmail);
    // le reste est donne les bonnes infos de cntact qui correspondent bien
    console.log("form SENDCONTACT EMAIL !!!!!!:", toEmail);
    console.log("form SENDCONTACT FIRSTNAME !!!!!!:", form.firstname);
    console.log("form SENDCONTACT LASTNAME !!!!!!:", form.lastname);
    console.log("form SENDCONTACT MESSAGE !!!!!!:", form.message);
    // ici ça donne les infos completes de contact
    console.log("form SENDCONTACT !!!!!!:", form);
    // ici ça donne bien le numero de la liste
    console.log("form SENDCONTACT !!!!!!:", listId);
    // ici ça donne bien la reponse
    console.log("res SENDCONTACT !!!!!!:", res);

    const attributesToAdd = [
      { name: "PRENOM", value: form.firstname },
      { name: "NOM", value: form.lastname },
      { name: "EMAIL", value: form.email },
      { name: "MESSAGE", value: form.message },
    ];
    // Création d'un objet pour stocker les arttributs
    const attributesObject = {};
    console.log("ATTRIBUTEOBJECT !!!!!!", attributesObject);
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

    console.log("LISTID DANS CREATE CONTACT DE SENDCONTACTVIABREVO", listId);
    console.log(
      "ATTRIBUTE OBJECT DANS CREATE CONTACT DE SENDCONTACTVIABREVO",
      attributesObject
    );
    console.log("TOEMAIL CREATE CONTACT DE SENDCONTACTVIABREVO", toEmail);

    const data = await apiInstance.createContact(createContact);
    res.json(data); // Renvoyez la réponse au client ici
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

  // Supprimez les espaces indésirables de l'e-mail de contact
  const cleanedEmailContact = emailContact.trim();
  // Assurez-vous que vous avez la valeur de userEmail à partir de req.body
  const userEmail = req.body; // Assurez-vous que le nom est correct

  if (!userEmail) {
    res.status(400).json({ error: "userEmail is required." });
    return;
  }
  setUpBrevo();
  send(cleanedEmailContact, userEmail);
  sendContactviaBrevo(cleanedEmailContact, form, 3, res);
  // Envoie une copie de l'e-mail de l'utilisateur
  const copySubject = "Copie de l'e-mail de l'utilisateur";
  const copyText = `Contenu de la copie\nE-mail de l'utilisateur : ${form.lastname}, ${form.firstname}, ${form.email}, ${form.message}  `;
  sendEmail(process.env.TRANSP_USER, copySubject, copyText);
});

app.get("/", (req, res) => {
  res.send("Welcome to the Tako Dev backend. Follow the white rabbit.");
});

app.listen(process.env.PORT, () =>
  console.log(`Application started on port: ${process.env.PORT}`)
);
