import mongoose, { Schema } from 'mongoose';
import { IPatient } from '../types';

const patientSchema = new Schema<IPatient>({
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{
    type: String
  }],
  chronicConditions: [{
    type: String
  }],
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    }
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'HealthcareWorker'
  }
}, {
  timestamps: true
});

// Generate patient ID before saving
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    this.patientId = `PT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IPatient>('Patient', patientSchema);
