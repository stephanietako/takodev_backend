import Joi from "joi";
import * as sanitizeHtml from "sanitize-html";

const validator = (shema) => (payload) => {
  // Échappement les valeurs de chaîne si nécessaire
  payload.name = encodeURIComponent(payload.name);
  payload.lastname = encodeURIComponent(payload.lastname);
  payload.message = encodeURIComponent(payload.message);
  // Nettoyer le HTML des données du formulaire
  payload.name = sanitizeHtml(payload.name).cleaned;
  payload.lastname = sanitizeHtml(payload.lastname).cleaned;
  payload.message = sanitizeHtml(payload.message).cleaned;

  return shema.validate(payload, { abortEarly: false });
};

const formSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  lastname: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(10).max(1000).required(),
});
export const validateForm = validator(formSchema);
