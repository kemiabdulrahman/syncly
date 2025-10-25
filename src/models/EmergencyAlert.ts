import mongoose, { Schema } from 'mongoose';
import { IEmergencyAlert, CasePriority } from '../types';

const emergencyAlertSchema = new Schema<IEmergencyAlert>({
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  priority: {
    type: String,
    enum: Object.values(CasePriority),
    default: CasePriority.EMERGENCY
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'HealthcareWorker'
  },
  assignedTo: [{
    type: String,
    ref: 'HealthcareWorker'
  }],
  respondedBy: [{
    type: String,
    ref: 'HealthcareWorker'
  }],
  status: {
    type: String,
    enum: ['active', 'responding', 'resolved'],
    default: 'active'
  },
  case: {
    type: String,
    ref: 'Case'
  },
  patient: {
    type: String,
    ref: 'Patient'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate alert ID before saving
emergencyAlertSchema.pre('save', async function(next) {
  if (!this.alertId) {
    this.alertId = `EA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IEmergencyAlert>('EmergencyAlert', emergencyAlertSchema);
