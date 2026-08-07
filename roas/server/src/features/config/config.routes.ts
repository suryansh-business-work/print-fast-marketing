import { Router } from 'express';
import * as configController from './config.controllers';

const router = Router();

router.get('/public', configController.getPublicConfig);

export default router;
