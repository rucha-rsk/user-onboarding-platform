import Joi from 'joi';

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().alphanum().min(2).max(50).required(),
  lastName: Joi.string().alphanum().min(2).max(50).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validationService = {
  validateRegistration(data) {
    return registrationSchema.validate(data, { abortEarly: false });
  },

  validateLogin(data) {
    return loginSchema.validate(data);
  },
};
