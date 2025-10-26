import mongoose, { Schema } from 'mongoose';
import { IMedicalRecord, RecordAccessLevel } from '../types/index.ts';

const medicalRecordSchema = new Schema<IMedicalRecord>({
  recordId: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  case: {
    type: String,
    ref: 'Case'
  },
  recordType: {
    type: String,
    required: true,
    enum: ['lab_result', 'imaging', 'prescription', 'consultation', 'surgery', 'vaccination', 'other']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  encryptedData: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String,
    encryptedUrl: String
  }],
  createdBy: {
    type: String,
    required: true,
    ref: 'HealthcareWorker'
  },
  accessControl: [{
    userId: {
      type: String,
      required: true,
      ref: 'HealthcareWorker'
    },
    accessLevel: {
      type: String,
      enum: Object.values(RecordAccessLevel),
      required: true
    },
    grantedBy: {
      type: String,
      required: true,
      ref: 'HealthcareWorker'
    },
    grantedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate record ID before saving
medicalRecordSchema.pre('save', async function(next) {
  if (!this.recordId) {
    this.recordId = `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IMedicalRecord>('MedicalRecord', medicalRecordSchema);
