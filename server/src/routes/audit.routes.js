import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { getAuditLogs } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// GET /api/audit - Admin only, get audit logs
router.get('/', protect, requireRole('admin', 'judge'), asyncHandler(async (req, res) => {
  const { caseId, userId, action, page, limit } = req.query;
  const result = await getAuditLogs({
    caseId,
    userId,
    action,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
  });
  res.json(result);
}));

// GET /api/audit/case/:caseId - Get audit logs for a specific case
router.get('/case/:caseId', protect, asyncHandler(async (req, res) => {
  const result = await getAuditLogs({
    caseId: req.params.caseId,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
  });
  res.json(result);
}));

export default router;
