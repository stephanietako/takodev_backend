import Joi from "joi";

const validator = (shema) => (payload) =>
  shema.validate(payload, { abortEarly: false });

const formSchema = Joi.object({
  firstname: Joi.string().alphanum().min(3).max(30).required(),
  lastname: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().trim().email().required(),
  message: Joi.string().min(10).max(1000).required(),
});
export const validateForm = validator(formSchema);
