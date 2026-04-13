import Case from '../models/Case.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { logAction } from '../services/audit.service.js';

// Generate a unique case number
const generateCaseNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Case.countDocuments();
  return `NYA-${year}-${String(count + 1).padStart(5, '0')}`;
};

export const list = asyncHandler(async (req, res) => {
  const { status, caseType, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (caseType) filter.caseType = caseType;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { caseNumber: { $regex: search, $options: 'i' } },
      { plaintiffName: { $regex: search, $options: 'i' } },
      { defendantName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [cases, total] = await Promise.all([
    Case.find(filter)
      .populate('judgeId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Case.countDocuments(filter),
  ]);

  res.json({ success: true, cases, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
});

export const create = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.caseNumber) {
    data.caseNumber = await generateCaseNumber();
  }
  if (req.user.role === 'judge') {
    data.judgeId = req.user._id;
  }

  const caseDoc = await Case.create(data);
  await logAction({ userId: req.user._id, caseId: caseDoc._id, action: 'case_created', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  res.status(201).json({ success: true, case: caseDoc });
});

export const getById = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id).populate('judgeId', 'fullName email');
  if (!caseDoc) throw new ApiError(404, 'Case not found');
  res.json({ success: true, case: caseDoc });
});

export const update = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!caseDoc) throw new ApiError(404, 'Case not found');
  await logAction({ userId: req.user._id, caseId: caseDoc._id, action: 'case_updated', details: { updatedFields: Object.keys(req.body) }, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  res.json({ success: true, case: caseDoc });
});

export const remove = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findOneAndDelete({ _id: req.params.id });
  if (!caseDoc) throw new ApiError(404, 'Case not found');
  await logAction({ userId: req.user._id, caseId: caseDoc._id, action: 'case_deleted', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  res.json({ success: true, message: 'Case and related data deleted' });
});

export const triggerAnalysis = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id);
  if (!caseDoc) throw new ApiError(404, 'Case not found');

  // Import dynamically to avoid circular deps
  const { runFullAnalysis } = await import('../services/analysis.service.js');

  caseDoc.status = 'analysis_pending';
  await caseDoc.save();

  const result = await runFullAnalysis(caseDoc._id, req.user._id);
  res.json({ success: true, ...result });
});
