import ChatMessage from '../models/ChatMessage.js';
import Case from '../models/Case.js';
import Document from '../models/Document.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { chatAboutCase } from '../services/ai/openai.service.js';
import { logAction } from '../services/audit.service.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const caseId = req.params.id;
  const { message } = req.body;

  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new ApiError(404, 'Case not found');

  // Save user message
  await ChatMessage.create({ caseId, userId: req.user._id, role: 'user', content: message });
  await logAction({ userId: req.user._id, caseId, action: 'chat_message_sent', details: { messageLength: message.length }, ipAddress: req.ip, userAgent: req.headers['user-agent'] });

  // Build case context
  const documents = await Document.find({ caseId, isProcessed: true }).select('aiSummary extractedText');
  const docContext = documents.map((d) => d.aiSummary || d.extractedText?.slice(0, 2000) || '').join('\n');
  const caseContext = `Case: ${caseDoc.title} (${caseDoc.caseNumber})\nType: ${caseDoc.caseType}\nDescription: ${caseDoc.description || 'N/A'}\nSummary: ${caseDoc.aiSummary || 'Not analyzed yet'}\n\nDocuments:\n${docContext}`;

  // Load recent chat history
  const history = await ChatMessage.find({ caseId }).sort({ createdAt: -1 }).limit(20);
  const messages = history.reverse().map((m) => ({ role: m.role, content: m.content }));

  // Get AI response
  const reply = await chatAboutCase(messages, caseContext);

  // Save assistant reply
  await ChatMessage.create({ caseId, userId: req.user._id, role: 'assistant', content: reply });
  await logAction({ userId: req.user._id, caseId, action: 'chat_response_received', details: { responseLength: reply.length }, aiInput: message, aiOutput: reply, ipAddress: req.ip, userAgent: req.headers['user-agent'] });

  res.json({ success: true, reply, caseId });
});

export const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await ChatMessage.find({ caseId: req.params.id })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, messages });
});
