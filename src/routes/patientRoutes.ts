import express from 'express';
import { PatientController } from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/auditLogger';
import { UserRole } from '../types';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN),
  auditLog('create', 'patient'),
  PatientController.createPatient
);

router.get(
  '/',
  authenticate,
  PatientController.getPatients
);

router.get(
  '/:id',
  authenticate,
  auditLog('read', 'patient'),
  PatientController.getPatientById
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN),
  auditLog('update', 'patient'),
  PatientController.updatePatient
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  auditLog('delete', 'patient'),
  PatientController.deletePatient
);

export default router;
