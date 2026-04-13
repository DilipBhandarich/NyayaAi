import StatuteMapping from '../models/StatuteMapping.js';
import { logAction } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/statutes - List all or search by section/code
export const search = asyncHandler(async (req, res) => {
  const { q, oldCode, newCode, category, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (oldCode) filter.oldCode = oldCode;
  if (newCode) filter.newCode = newCode;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (q) {
    filter.$or = [
      { oldSection: { $regex: q, $options: 'i' } },
      { newSection: { $regex: q, $options: 'i' } },
      { oldDescription: { $regex: q, $options: 'i' } },
      { newDescription: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [statutes, total] = await Promise.all([
    StatuteMapping.find(filter).sort({ oldCode: 1, oldSection: 1 }).skip(skip).limit(parseInt(limit)).lean(),
    StatuteMapping.countDocuments(filter),
  ]);

  res.json({
    success: true,
    statutes,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// GET /api/statutes/lookup/:section - Quick lookup (e.g., "302" or "498A")
export const lookup = asyncHandler(async (req, res) => {
  const section = req.params.section;
  const results = await StatuteMapping.find({
    $or: [
      { oldSection: section },
      { newSection: section },
    ],
  }).lean();

  if (req.user) {
    await logAction({ userId: req.user._id, action: 'statute_lookup', details: { section, resultsCount: results.length } });
  }

  res.json({ success: true, results });
});

// GET /api/statutes/categories - Get distinct categories
export const categories = asyncHandler(async (req, res) => {
  const cats = await StatuteMapping.distinct('category');
  res.json({ success: true, categories: cats.filter(Boolean).sort() });
});
