import express from 'express';
import { CaseController } from '../controllers/caseController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { auditLog } from '../middleware/auditLogger.ts';
import { UserRole } from '../types/index.ts';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.SPECIALIST),
  auditLog('create', 'case'),
  CaseController.createCase
);

router.get(
  '/',
  authenticate,
  CaseController.getCases
);

router.get(
  '/:id',
  authenticate,
  auditLog('read', 'case'),
  CaseController.getCaseById
);

router.put(
  '/:id',
  authenticate,
  auditLog('update', 'case'),
  CaseController.updateCase
);

router.put(
  '/:id/assign',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  auditLog('update', 'case'),
  CaseController.assignCase
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DOCTOR),
  auditLog('delete', 'case'),
  CaseController.deleteCase
);

export default router;
