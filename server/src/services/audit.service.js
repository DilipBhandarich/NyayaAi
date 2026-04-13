import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

export async function logAction({ userId, caseId, action, details, aiModel, aiInput, aiOutput, durationMs, ipAddress, userAgent }) {
  try {
    await AuditLog.create({
      userId,
      caseId: caseId || null,
      action,
      details: details || null,
      aiModel: aiModel || null,
      aiInput: aiInput ? String(aiInput).slice(0, 500) : null,
      aiOutput: aiOutput ? String(aiOutput).slice(0, 500) : null,
      durationMs: durationMs || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  } catch (err) {
    // Audit logging should never crash the main flow
    logger.error(`Audit log failed: ${err.message}`);
  }
}

export async function getAuditLogs({ caseId, userId, action, page = 1, limit = 50 }) {
  const filter = {};
  if (caseId) filter.caseId = caseId;
  if (userId) filter.userId = userId;
  if (action) filter.action = action;

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'fullName email role')
    .populate('caseId', 'caseNumber title')
    .lean();

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
}
