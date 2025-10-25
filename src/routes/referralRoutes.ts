import express from 'express';
import { ReferralController } from '../controllers/referralController';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/auditLogger';
import { UserRole } from '../types';

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
