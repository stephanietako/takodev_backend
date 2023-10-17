import express from "express";
import cors from "cors";
import "dotenv/config";
import { validateForm } from "./validator.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("welcome to the tako dev backend follow the white rabbit");
});

const formSchema = app.post("/add-contact", (req, res) => {
  const { error, value } = validateForm(req.body);

  if (error) {
    console.log(error.details);
    return res
      .status(400)
      .send("You missed the rabbit hole, the data sent are invalid");
  }
  res.send("Succefully you have reached the rabbit hole");
});

app.listen(PORT, () => console.log(`Application démarée sur le port: ${PORT}`));
