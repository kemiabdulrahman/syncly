import express from 'express';
import { EmergencyController } from '../controllers/emergencyController';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/auditLogger';

const router = express.Router();

router.post(
  '/',
  authenticate,
  auditLog('create', 'emergency_alert'),
  EmergencyController.createAlert
);

router.get(
  '/',
  authenticate,
  EmergencyController.getAlerts
);

router.get(
  '/:id',
  authenticate,
  auditLog('read', 'emergency_alert'),
  EmergencyController.getAlertById
);

router.put(
  '/:id/respond',
  authenticate,
  auditLog('update', 'emergency_alert'),
  EmergencyController.respondToAlert
);

router.put(
  '/:id/resolve',
  authenticate,
  auditLog('update', 'emergency_alert'),
  EmergencyController.resolveAlert
);

router.delete(
  '/:id',
  authenticate,
  auditLog('delete', 'emergency_alert'),
  EmergencyController.deleteAlert
);

export default router;
