// src/routes/analytics.routes.ts
import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticateJWT, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);
router.use(isAdmin as any);

router.get('/kpis', analyticsController.getKpis as any);
router.get('/sales-trend', analyticsController.getSalesTrend as any);
router.get('/product-sales', analyticsController.getProductSalesDistribution as any);
router.get('/top-customers', analyticsController.getTopCustomersBySpend as any);

router.get('/test', (req, res) => {
  res.send('Analytics test route is working!');
});

export default router;