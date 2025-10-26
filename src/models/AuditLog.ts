import mongoose, { Schema } from 'mongoose';
import { IAuditLog } from '../types/index.js';

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: String,
    required: true,
    ref: 'HealthcareWorker'
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'share', 'access_denied']
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['patient', 'case', 'medical_record', 'referral', 'emergency_alert', 'discussion']
  },
  resourceId: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
