import mongoose, { Schema } from 'mongoose';
import { IReferral, CasePriority, ReferralStatus } from '../types';

const referralSchema = new Schema<IReferral>({
  referralId: {
    type: String,
    required: true,
    unique: true
  },
  case: {
    type: String,
    required: true,
    ref: 'Case'
  },
  patient: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  fromProvider: {
    type: String,
    required: true,
    ref: 'HealthcareWorker'
  },
  toProvider: {
    type: String,
    required: true,
    ref: 'HealthcareWorker'
  },
  reason: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: Object.values(CasePriority),
    default: CasePriority.ROUTINE
  },
  status: {
    type: String,
    enum: Object.values(ReferralStatus),
    default: ReferralStatus.PENDING
  },
  notes: {
    type: String
  },
  responseNotes: {
    type: String
  },
  respondedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate referral ID before saving
referralSchema.pre('save', async function(next) {
  if (!this.referralId) {
    this.referralId = `RF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IReferral>('Referral', referralSchema);
