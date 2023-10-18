import express from "express";
import cors from "cors";
import "dotenv/config";
import { validateForm } from "./validator.js";
import { createTransport } from "nodemailer";
const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("welcome to the tako dev backend follow the white rabbit");
});
app.post("/add-contact", async (req, res) => {
  const { error, value } = validateForm(req.body);
  if (error) {
    console.log(error.details);
    return res
      .status(400)
      .send("You missed the rabbit hole, the data sent are invalid");
  }

  const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.TRANSP_USER,
      pass: process.env.API_KEY,
    },
  });

  const mailOptions = {
    from: process.env.TRANSP_USER,
    to: req.body.email,
    subject: "Vous avez des questions ? Un projet ? ",
    text: "contactez-moi pour en discuter",
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("Succefully you have reached the rabbit hole");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong, you missed the rabbit hole ");
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Application démarée sur le port : ${process.env.PORT}`)
);
