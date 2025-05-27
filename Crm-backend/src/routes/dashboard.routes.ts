// src/routes/dashboard.routes.ts
import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticateJWT, isAdmin } from '../middlewares/auth.middleware'; // Asumsi hanya admin/superadmin

const router = Router();

// Semua rute dashboard dilindungi dan memerlukan peran admin
router.use(authenticateJWT as any);
router.use(isAdmin as any);

router.get('/summary', dashboardController.getDashboardSummary as any);

export default router;