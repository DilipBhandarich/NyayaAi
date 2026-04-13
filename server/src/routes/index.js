import { Router } from 'express';
import authRoutes from './auth.routes.js';
import caseRoutes from './case.routes.js';
import documentRoutes from './document.routes.js';
import evidenceRoutes from './evidence.routes.js';
import predictionRoutes from './prediction.routes.js';
import chatRoutes from './chat.routes.js';
import similarRoutes from './similar.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import auditRoutes from './audit.routes.js';
import bailRoutes from './bail.routes.js';
import statuteRoutes from './statute.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/', documentRoutes);
router.use('/cases', evidenceRoutes);
router.use('/cases', predictionRoutes);
router.use('/cases', chatRoutes);
router.use('/cases', similarRoutes);
router.use('/cases', bailRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit', auditRoutes);
router.use('/statutes', statuteRoutes);

export default router;
