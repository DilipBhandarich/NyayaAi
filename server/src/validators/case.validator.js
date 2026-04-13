import Joi from 'joi';

export const createCaseSchema = Joi.object({
  title: Joi.string().trim().required(),
  caseType: Joi.string().valid('criminal', 'civil', 'constitutional', 'family', 'labor', 'consumer', 'tax', 'land_revenue', 'motor_accident', 'arbitration', 'writ_petition', 'pil').required(),
  caseNumber: Joi.string().trim().allow(null, ''),
  description: Joi.string().allow(null, ''),
  plaintiffName: Joi.string().trim().allow(null, ''),
  defendantName: Joi.string().trim().allow(null, ''),
  plaintiffLawyer: Joi.string().trim().allow(null, ''),
  defendantLawyer: Joi.string().trim().allow(null, ''),
  courtName: Joi.string().trim().allow(null, ''),
  filingDate: Joi.date().iso().allow(null),
});

export const updateCaseSchema = Joi.object({
  title: Joi.string().trim(),
  status: Joi.string().valid('filed', 'under_review', 'analysis_pending', 'analysis_complete', 'judgment_pending', 'closed'),
  description: Joi.string().allow(null, ''),
  plaintiffName: Joi.string().trim().allow(null, ''),
  defendantName: Joi.string().trim().allow(null, ''),
  plaintiffLawyer: Joi.string().trim().allow(null, ''),
  defendantLawyer: Joi.string().trim().allow(null, ''),
  courtName: Joi.string().trim().allow(null, ''),
}).min(1);
