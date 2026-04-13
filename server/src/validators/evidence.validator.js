import Joi from 'joi';

export const createEvidenceSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().allow(null, ''),
  evidenceType: Joi.string().trim().allow(null, ''),
  documentId: Joi.string().hex().length(24).allow(null),
});

export const chatMessageSchema = Joi.object({
  message: Joi.string().trim().required(),
});
