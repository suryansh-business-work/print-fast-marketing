import { Router } from 'express';
import * as authController from './auth.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { loginSchema, signupSchema, changePasswordSchema } from './auth.validators';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), authController.login);

router.post('/signup', validateRequest({ body: signupSchema }), authController.signup);

router.post('/logout', requireAuth, authController.logout);

router.get('/me', requireAuth, authController.me);

router.post(
  '/change-password',
  requireAuth,
  validateRequest({ body: changePasswordSchema }),
  authController.changePassword,
);

router.post('/send-god-user-credentials', authController.sendGodUserCredentials);

export default router;
