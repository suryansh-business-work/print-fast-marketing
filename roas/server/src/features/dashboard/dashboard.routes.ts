import { Router } from 'express';
import * as dashboardController from './dashboard.controllers';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, dashboardController.getDashboardStats);

export default router;
