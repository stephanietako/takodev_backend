// import express from "express";
// import cors from "cors";
// import "dotenv/config";

// import { validateForm } from "./validator.js";
// import helmet from "helmet";
// import SibApiV3Sdk from "sib-api-v3-sdk";
// import send from "./mailing.js";

// const app = express();

// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // Fonction pour configurer l'API Brevo
// const setUpBrevo = () => {
//   let defaultClient = SibApiV3Sdk.ApiClient.instance;
//   let apiKey = defaultClient.authentications["api-key"];
//   apiKey.apiKey = process.env.API_KEY;
// };

// // Fonction pour stocker des datas de contact d'utilisateur dans Brevo
// const sendEmailviaBrevo = async (toEmail, listId, res) => {
//   setUpBrevo();

//   const apiInstance = new SibApiV3Sdk.ContactsApi();
//   const createContact = {
//     email: toEmail,
//     listIds: [listId],
//     emailBlacklisted: false,
//     smsBlacklisted: false,
//     updateEnabled: false,
//   };

//   try {
//     await apiInstance.createContact(createContact);
//     console.log("E-mail envoyé avec succès via Brevo");
//     res.json({ success: true }); // Renvoie une réponse JSON pour indiquer le succès
//   } catch (error) {
//     console.error("Erreur lors de l'envoi de l'e-mail avec Brevo : " + error);
//     console.error(error);
//     res.json({ success: false }); // Renvoie une réponse JSON pour indiquer l'échec
//   }
// };

// app.post("/email", async (req, res) => {
//   const { error, value } = req.body.email;
//   if (error) {
//     console.log(error.details);
//     return res.status(400).json({ error: "Invalid data sent send email." });
//   }
//   try {
//     const emailSent = send(req.body.email);
//     if (emailSent) {
//       sendEmailviaBrevo(emailSent, 4, res);
//       return res.status(200).json({ success: true });
//     }
//   } catch (error) {
//     console.error("Une erreur s'est produite dans la route /email : " + error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// //contact form
// app.post("/contact", async (req, res) => {
//   const { error, value } = validateForm(req.body);
//   if (error) {
//     console.log(error.details);
//     return res.status(400).json({ error: "Invalid data sent ." });
//   }

//   const { firstname, lastname, email, message } = req.body;

//   setUpBrevo();

//   const apiInstance = new SibApiV3Sdk.ContactsApi();
//   const createContact = {
//     email,
//     attributes: {
//       MESSAGE: message,
//       PRENOM: firstname,
//       NOM: lastname,
//     },
//     listIds: [3],
//     emailBlacklisted: false,
//     smsBlacklisted: false,
//     updateEnabled: false,
//   };

//   try {
//     await apiInstance.createContact(createContact);
//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false });
//   }
// });

// app.get("/", (req, res) => {
//   res.send("Welcome to the Tako Dev backend. Follow the white rabbit.");
// });

// app.listen(process.env.PORT, () =>
//   console.log(`Application started on port: ${process.env.PORT}`)
// );
import express from "express";
import cors from "cors";
import "dotenv/config";
import fetch from "node-fetch";
import { validateForm } from "./validator.js";
import helmet from "helmet";
import SibApiV3Sdk from "sib-api-v3-sdk";
import send from "./mailing.js";

const app = express();
let apiInstance;

app.use(helmet());
app.use(cors());
app.use(express.json());

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

  const { error, value } = req.body.email;
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent send email." });
  }

  const userEmail = req.body.email;
  console.log("Adresse e-mail de l'utilisateur : " + userEmail);

  setUpBrevo(); // Assurez-vous que setUpBrevo est correctement appelé avant l'utilisation de apiInstance
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

  setUpBrevo(); // Assurez-vous que setUpBrevo est correctement appelé avant l'utilisation de apiInstance

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
