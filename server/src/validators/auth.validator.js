import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().trim().required(),
  role: Joi.string().valid('judge', 'clerk', 'lawyer', 'admin').default('judge'),
  courtName: Joi.string().trim().allow(null, ''),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
