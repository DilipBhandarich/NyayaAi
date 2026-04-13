import Prediction from '../models/Prediction.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listByCaseId = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ caseId: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, predictions });
});
