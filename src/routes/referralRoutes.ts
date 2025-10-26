import express from 'express';
import { ReferralController } from '../controllers/referralController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/auditLogger.js';
import { UserRole } from '../types/index.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.SPECIALIST, UserRole.NURSE),
  auditLog('create', 'referral'),
  ReferralController.createReferral
);

router.get(
  '/',
  authenticate,
  ReferralController.getReferrals
);

router.get(
  '/:id',
  authenticate,
  auditLog('read', 'referral'),
  ReferralController.getReferralById
);

router.put(
  '/:id/respond',
  authenticate,
  auditLog('update', 'referral'),
  ReferralController.respondToReferral
);

router.put(
  '/:id/complete',
  authenticate,
  auditLog('update', 'referral'),
  ReferralController.completeReferral
);

export default router;
