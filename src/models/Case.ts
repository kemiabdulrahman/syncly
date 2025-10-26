import mongoose, { Schema } from 'mongoose';
import { ICase, CaseStatus, CasePriority } from '../types/index.js';

const caseSchema = new Schema<ICase>({
  caseId: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  assignedTo: [{
    type: String,
    ref: 'HealthcareWorker'
  }],
  createdBy: {
    type: String,
    required: true,
    ref: 'HealthcareWorker'
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
  status: {
    type: String,
    enum: Object.values(CaseStatus),
    default: CaseStatus.OPEN
  },
  priority: {
    type: String,
    enum: Object.values(CasePriority),
    default: CasePriority.ROUTINE
  },
  symptoms: [{
    type: String
  }],
  diagnosis: {
    type: String
  },
  treatment: {
    type: String
  },
  notes: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedBy: {
      type: String,
      ref: 'HealthcareWorker'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate case ID before saving
caseSchema.pre('save', async function(next) {
  if (!this.caseId) {
    this.caseId = `CS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export default mongoose.model<ICase>('Case', caseSchema);
