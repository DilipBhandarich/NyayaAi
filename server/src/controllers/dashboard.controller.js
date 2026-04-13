import Case from '../models/Case.js';
import Prediction from '../models/Prediction.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const [
    totalCases,
    pendingAnalysis,
    completedAnalysis,
    criminalCases,
    civilCases,
    recentCases,
    recentPredictions,
  ] = await Promise.all([
    Case.countDocuments(),
    Case.countDocuments({ status: { $in: ['filed', 'under_review', 'analysis_pending'] } }),
    Case.countDocuments({ status: 'analysis_complete' }),
    Case.countDocuments({ caseType: 'criminal' }),
    Case.countDocuments({ caseType: 'civil' }),
    Case.find().sort({ createdAt: -1 }).limit(5).select('caseNumber title caseType status createdAt'),
    Prediction.find().sort({ createdAt: -1 }).limit(5).populate('caseId', 'caseNumber title'),
  ]);

  res.json({
    success: true,
    stats: {
      totalCases,
      pendingAnalysis,
      completedAnalysis,
      criminalCases,
      civilCases,
      recentCases,
      recentPredictions,
    },
  });
});
