import Joi from "joi";

const validator = (shema) => (payload) => {
  // Filtrer les valeurs de chaîne avant de les échapper
  payload.name = payload.name.filter((c) => c !== "<");
  payload.lastname = payload.lastname.filter((c) => c !== "<");
  payload.message = payload.message.filter((c) => c !== "<");
  // Échapper les valeurs de chaîne si nécessaire
  payload.name = encodeURIComponent(payload.name);
  payload.lastname = encodeURIComponent(payload.lastname);
  payload.message = encodeURIComponent(payload.message);

  return shema.validate(payload, { abortEarly: false });
};

const formSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  lastname: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(10).max(1000).required(),
});
export const validateForm = validator(formSchema);
