import express from 'express';
import { MedicalRecordController } from '../controllers/medicalRecordController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { auditLog } from '../middleware/auditLogger.ts';
import { UserRole } from '../types/index.ts';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.SPECIALIST),
  auditLog('create', 'medical_record'),
  MedicalRecordController.createRecord
);

router.get(
  '/',
  authenticate,
  MedicalRecordController.getRecords
);

router.get(
  '/:id',
  authenticate,
  auditLog('read', 'medical_record'),
  MedicalRecordController.getRecordById
);

router.post(
  '/:id/share',
  authenticate,
  auditLog('share', 'medical_record'),
  MedicalRecordController.shareRecord
);

router.post(
  '/:id/revoke',
  authenticate,
  auditLog('update', 'medical_record'),
  MedicalRecordController.revokeAccess
);

export default router;
