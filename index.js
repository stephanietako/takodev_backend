import express from "express";
import cors from "cors";
import "dotenv/config";
import fetch from "node-fetch";
import { validateForm } from "./validator.js";
import helmet from "helmet";
import SibApiV3Sdk from "sib-api-v3-sdk";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Tako Dev backend. Follow the white rabbit.");
});

app.post("/create-contact", async (req, res) => {
  const { error, value } = validateForm(req.body);
  if (error) {
    console.log(error.details);
    return res.status(400).json({ error: "Invalid data sent ." });
  }
  // Récupérez les données du formulaire
  const { firstname, lastname, email, message } = req.body;
  console.log("req.body", req.body);
  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.API_KEY;
  // Créez une instance de l'API Brevo Contacts
  const apiInstance = new SibApiV3Sdk.ContactsApi();

  let createContact = new SibApiV3Sdk.CreateContact();
  (createContact = {
    email: email,
    attributes: {
      MESSAGE: message,
      FNAME: firstname,
      LNAME: lastname,
      MESSAGE: message,
    },

    listIds: [3],
    emailBlacklisted: false,
    smsBlacklisted: false,
    updateEnabled: false,
  }),
    console.log("req.body.firstname", req.body.firstname);
  console.log("req.body.lastname", req.body.lastname);
  console.log("req.body.message", req.body.message);
  // Appelez l'API pour créer le contact
  apiInstance.createContact(createContact).then(
    function (data) {
      console.log("API called successfully. Returned data: ", data);
      res.json({ success: true });
    },
    function (error) {
      console.error(error);
      res.json({ success: false });
    }
  );

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(createContact),
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
