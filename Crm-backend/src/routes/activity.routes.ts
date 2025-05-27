// src/routes/activity.routes.ts
import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import { authenticateJWT, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);
router.use(isAdmin as any); // Pastikan hanya admin yang bisa lihat aktivitas ini

router.get('/recent', activityController.getRecentActivities as any); // Endpoint: GET /api/activities/recent

export default router;