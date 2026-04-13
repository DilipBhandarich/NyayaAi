import PDFDocument from 'pdfkit';
import Case from '../models/Case.js';
import Evidence from '../models/Evidence.js';
import Prediction from '../models/Prediction.js';
import { logAction } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';

export const exportPdf = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id).populate('judgeId', 'fullName').lean();
  if (!caseDoc) throw new ApiError(404, 'Case not found');

  const evidenceItems = await Evidence.find({ caseId: caseDoc._id }).lean();
  const prediction = await Prediction.findOne({ caseId: caseDoc._id }).sort({ createdAt: -1 }).lean();

  const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="NyayaAI-${caseDoc.caseNumber}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(10).fillColor('#666').text('AI-GENERATED ADVISORY REPORT — NOT A JUDGMENT', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(20).fillColor('#1e40af').text('NyayaAI Case Analysis Report', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#666').text(`Generated: ${new Date().toLocaleString('en-IN')} | Case: ${caseDoc.caseNumber}`, { align: 'center' });
  doc.moveDown(1);
  doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke('#ddd');
  doc.moveDown(0.5);

  // Case Info
  doc.fontSize(14).fillColor('#1e293b').text('Case Information');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#334155');
  const info = [
    ['Title', caseDoc.title],
    ['Case Number', caseDoc.caseNumber],
    ['Type', caseDoc.caseType?.toUpperCase()],
    ['Status', caseDoc.status?.replace(/_/g, ' ').toUpperCase()],
    ['Court', caseDoc.courtName || 'N/A'],
    ['Judge', caseDoc.judgeId?.fullName || 'N/A'],
    ['Plaintiff/Prosecution', caseDoc.plaintiffName || 'N/A'],
    ['Defendant/Accused', caseDoc.defendantName || 'N/A'],
  ];
  for (const [label, value] of info) {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value || 'N/A');
  }
  doc.moveDown(1);

  // AI Summary
  if (caseDoc.aiSummary) {
    doc.fontSize(14).fillColor('#1e293b').text('AI Summary');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#334155').text(caseDoc.aiSummary, { lineGap: 2 });
    doc.moveDown(1);
  }

  // Key Facts
  if (caseDoc.aiKeyFacts?.length > 0) {
    doc.fontSize(14).fillColor('#1e293b').text('Key Facts');
    doc.moveDown(0.3);
    caseDoc.aiKeyFacts.forEach((fact, i) => {
      doc.fontSize(10).fillColor('#334155').text(`${i + 1}. ${fact}`, { indent: 10, lineGap: 2 });
    });
    doc.moveDown(1);
  }

  // Evidence
  if (evidenceItems.length > 0) {
    doc.addPage();
    doc.fontSize(14).fillColor('#1e293b').text('Evidence Assessment');
    doc.moveDown(0.3);
    evidenceItems.forEach((ev, i) => {
      doc.fontSize(10).fillColor('#334155');
      doc.font('Helvetica-Bold').text(`${i + 1}. ${ev.title}`, { continued: true });
      doc.font('Helvetica').text(` — Strength: ${(ev.strength || 'N/A').toUpperCase()}`);
      if (ev.description) doc.text(`   ${ev.description}`, { indent: 15 });
      doc.moveDown(0.3);
    });
    doc.moveDown(1);
  }

  // Prediction
  if (prediction) {
    doc.addPage();
    doc.fontSize(14).fillColor('#1e293b').text('AI Judgment Prediction');
    doc.moveDown(0.3);

    doc.fontSize(11).fillColor('#1e40af');
    doc.font('Helvetica-Bold').text(`Predicted Outcome: ${prediction.predictedOutcome || 'N/A'}`);
    doc.font('Helvetica').text(`Confidence: ${prediction.confidenceScore ? (prediction.confidenceScore * 100).toFixed(0) + '%' : 'N/A'}`);
    doc.moveDown(0.5);

    if (prediction.reasoning) {
      doc.fontSize(10).fillColor('#334155').text(prediction.reasoning, { lineGap: 2 });
      doc.moveDown(0.5);
    }

    if (prediction.judgmentRecommendation) {
      const jr = prediction.judgmentRecommendation;
      doc.fontSize(12).fillColor('#1e293b').text('Judgment Recommendation');
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#334155');
      if (jr.verdict) { doc.font('Helvetica-Bold').text('Verdict: ', { continued: true }); doc.font('Helvetica').text(jr.verdict); }
      if (jr.sentencingGuideline) { doc.font('Helvetica-Bold').text('Sentencing: ', { continued: true }); doc.font('Helvetica').text(jr.sentencingGuideline); }
      if (jr.fineRange) { doc.font('Helvetica-Bold').text('Fine: ', { continued: true }); doc.font('Helvetica').text(jr.fineRange); }
      if (jr.compensationToVictim) { doc.font('Helvetica-Bold').text('Compensation: ', { continued: true }); doc.font('Helvetica').text(jr.compensationToVictim); }
      doc.moveDown(0.5);
    }

    if (prediction.applicableSections?.length > 0) {
      doc.fontSize(12).fillColor('#1e293b').text('Applicable Sections');
      doc.moveDown(0.3);
      prediction.applicableSections.forEach((s) => {
        doc.fontSize(10).fillColor('#334155');
        doc.font('Helvetica-Bold').text(s.section, { continued: true });
        doc.font('Helvetica').text(` — ${s.description || ''} (Max: ${s.maxPenalty || 'N/A'})`);
      });
      doc.moveDown(0.5);
    }

    if (prediction.precedentAnalysis?.length > 0) {
      doc.fontSize(12).fillColor('#1e293b').text('Precedent Analysis');
      doc.moveDown(0.3);
      prediction.precedentAnalysis.forEach((p) => {
        doc.fontSize(10).fillColor('#334155');
        doc.font('Helvetica-Bold').text(`${p.caseName} (${p.citation || 'N/A'})`);
        doc.font('Helvetica').text(`  Relevance: ${p.relevance || 'N/A'}`);
        doc.font('Helvetica').text(`  Outcome: ${p.outcome || 'N/A'}`);
        doc.moveDown(0.2);
      });
      doc.moveDown(0.5);
    }

    // Aggravating / Mitigating
    if (prediction.aggravatingFactors?.length > 0) {
      doc.fontSize(12).fillColor('#1e293b').text('Aggravating Factors');
      prediction.aggravatingFactors.forEach(f => doc.fontSize(10).fillColor('#dc2626').text(`  • ${f}`));
      doc.moveDown(0.3);
    }
    if (prediction.mitigatingFactors?.length > 0) {
      doc.fontSize(12).fillColor('#1e293b').text('Mitigating Factors');
      prediction.mitigatingFactors.forEach(f => doc.fontSize(10).fillColor('#16a34a').text(`  • ${f}`));
      doc.moveDown(0.3);
    }

    // Bail
    if (prediction.bailAnalysis?.recommendation) {
      doc.fontSize(12).fillColor('#1e293b').text('Bail Analysis');
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#334155');
      doc.font('Helvetica-Bold').text('Recommendation: ', { continued: true });
      doc.font('Helvetica').text(prediction.bailAnalysis.recommendation);
      if (prediction.bailAnalysis.reasoning) doc.text(prediction.bailAnalysis.reasoning, { lineGap: 2 });
      doc.moveDown(0.5);
    }
  }

  // Disclaimer
  doc.addPage();
  doc.fontSize(12).fillColor('#92400e').text('DISCLAIMER', { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#92400e').text(
    'This is an AI-generated advisory analysis produced by NyayaAI. It is NOT a legal opinion, judgment, or binding recommendation. ' +
    'This report is intended solely as a research aid for judicial officers. The final decision must be made by the presiding judge ' +
    'based on their independent assessment of facts, evidence, and applicable law. AI predictions are probabilistic assessments and ' +
    'should not be the sole basis for any judicial decision. The AI system may contain errors, biases, or limitations. ' +
    'All case citations should be independently verified before reliance.',
    { lineGap: 3 }
  );

  doc.end();

  await logAction({ userId: req.user._id, caseId: caseDoc._id, action: 'pdf_exported' });
});
