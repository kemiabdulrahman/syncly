import { Document } from 'mongoose';

export enum UserRole {
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin',
  SPECIALIST = 'specialist',
  PARAMEDIC = 'paramedic'
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_REFERRAL = 'pending_referral',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum CasePriority {
  EMERGENCY = 'emergency',
  URGENT = 'urgent',
  ROUTINE = 'routine',
  LOW = 'low'
}

export enum ReferralStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum RecordAccessLevel {
  OWNER = 'owner',
  SHARED_FULL = 'shared_full',
  SHARED_LIMITED = 'shared_limited',
  EMERGENCY = 'emergency'
}

export interface IHealthcareWorker extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  specialization?: string;
  licenseNumber: string;
  phoneNumber: string;
  department?: string;
  isActive: boolean;
  lastActive: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IPatient extends Document {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICase extends Document {
  caseId: string;
  patient: string;
  assignedTo: string[];
  createdBy: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  symptoms: string[];
  diagnosis?: string;
  treatment?: string;
  notes: string;
  attachments: Array<{
    filename: string;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiscussion extends Document {
  case: string;
  messages: Array<{
    sender: string;
    senderName: string;
    message: string;
    timestamp: Date;
    isEdited: boolean;
  }>;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicalRecord extends Document {
  recordId: string;
  patient: string;
  case?: string;
  recordType: string;
  title: string;
  content: string;
  encryptedData?: string;
  attachments: Array<{
    filename: string;
    url: string;
    encryptedUrl?: string;
  }>;
  createdBy: string;
  accessControl: Array<{
    userId: string;
    accessLevel: RecordAccessLevel;
    grantedBy: string;
    grantedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReferral extends Document {
  referralId: string;
  case: string;
  patient: string;
  fromProvider: string;
  toProvider: string;
  reason: string;
  urgency: CasePriority;
  status: ReferralStatus;
  notes?: string;
  responseNotes?: string;
  createdAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
}

export interface IEmergencyAlert extends Document {
  alertId: string;
  title: string;
  description: string;
  location?: string;
  priority: CasePriority;
  createdBy: string;
  assignedTo: string[];
  respondedBy: string[];
  status: 'active' | 'responding' | 'resolved';
  case?: string;
  patient?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface IAuditLog extends Document {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
