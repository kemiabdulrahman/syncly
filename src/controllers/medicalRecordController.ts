import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import MedicalRecord from '../models/MedicalRecord.ts';
import { EncryptionService } from '../utils/encryption.ts';
import { RecordAccessLevel } from '../types/index.ts';

export class MedicalRecordController {
  static async createRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { patient, caseId, recordType, title, content, attachments, encrypt } = req.body;

      if (!patient || !recordType || !title || !content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      let encryptedData: string | undefined;
      let finalContent = content;

      // Encrypt sensitive data if requested
      if (encrypt) {
        const encrypted = EncryptionService.encrypt(content);
        encryptedData = JSON.stringify(encrypted);
        finalContent = '[ENCRYPTED]';
      }

      const record = await MedicalRecord.create({
        patient,
        case: caseId,
        recordType,
        title,
        content: finalContent,
        encryptedData,
        attachments: attachments || [],
        createdBy: req.user?.userId,
        accessControl: [
          {
            userId: req.user?.userId,
            accessLevel: RecordAccessLevel.OWNER,
            grantedBy: req.user?.userId,
            grantedAt: new Date()
          }
        ]
      });

      res.status(201).json({ message: 'Medical record created successfully', record });
    } catch (error: any) {
      console.error('Create record error:', error);
      res.status(500).json({ error: 'Failed to create medical record', details: error.message });
    }
  }

  static async getRecords(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { patientId, caseId, recordType, limit = 50, skip = 0 } = req.query;

      let query: any = {};

      if (patientId) {
        query.patient = patientId;
      }

      if (caseId) {
        query.case = caseId;
      }

      if (recordType) {
        query.recordType = recordType;
      }

      // Filter by access control
      query['accessControl.userId'] = req.user?.userId;

      const records = await MedicalRecord.find(query)
        .populate('patient', 'firstName lastName patientId')
        .populate('createdBy', 'firstName lastName role')
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ createdAt: -1 });

      const total = await MedicalRecord.countDocuments(query);

      res.json({ records, total });
    } catch (error: any) {
      console.error('Get records error:', error);
      res.status(500).json({ error: 'Failed to fetch medical records', details: error.message });
    }
  }

  static async getRecordById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { decrypt } = req.query;

      const record = await MedicalRecord.findById(id)
        .populate('patient')
        .populate('createdBy', 'firstName lastName role')
        .populate('accessControl.userId', 'firstName lastName role');

      if (!record) {
        res.status(404).json({ error: 'Medical record not found' });
        return;
      }

      // Check access control
      const hasAccess = record.accessControl.some(
        (ac: any) => ac.userId._id.toString() === req.user?.userId
      );

      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied to this medical record' });
        return;
      }

      // Decrypt if requested and data is encrypted
      if (decrypt === 'true' && record.encryptedData) {
        try {
          const encryptedObj = JSON.parse(record.encryptedData);
          const decryptedContent = EncryptionService.decrypt(
            encryptedObj.encryptedData,
            encryptedObj.iv,
            encryptedObj.authTag
          );
          (record as any).decryptedContent = decryptedContent;
        } catch (error) {
          console.error('Decryption error:', error);
        }
      }

      res.json({ record });
    } catch (error: any) {
      console.error('Get record error:', error);
      res.status(500).json({ error: 'Failed to fetch medical record', details: error.message });
    }
  }

  static async shareRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, accessLevel } = req.body;

      if (!userId || !accessLevel) {
        res.status(400).json({ error: 'userId and accessLevel are required' });
        return;
      }

      const record = await MedicalRecord.findById(id);

      if (!record) {
        res.status(404).json({ error: 'Medical record not found' });
        return;
      }

      // Check if requester is the owner
      const isOwner = record.accessControl.some(
        (ac: any) => ac.userId.toString() === req.user?.userId && ac.accessLevel === RecordAccessLevel.OWNER
      );

      if (!isOwner) {
        res.status(403).json({ error: 'Only the owner can share this record' });
        return;
      }

      // Check if user already has access
      const existingAccess = record.accessControl.findIndex(
        (ac: any) => ac.userId.toString() === userId
      );

      if (existingAccess !== -1) {
        // Update existing access
        record.accessControl[existingAccess].accessLevel = accessLevel;
        record.accessControl[existingAccess].grantedBy = req.user?.userId!;
        record.accessControl[existingAccess].grantedAt = new Date();
      } else {
        // Add new access
        record.accessControl.push({
          userId,
          accessLevel,
          grantedBy: req.user?.userId!,
          grantedAt: new Date()
        });
      }

      await record.save();

      res.json({ message: 'Record shared successfully', record });
    } catch (error: any) {
      console.error('Share record error:', error);
      res.status(500).json({ error: 'Failed to share medical record', details: error.message });
    }
  }

  static async revokeAccess(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const record = await MedicalRecord.findById(id);

      if (!record) {
        res.status(404).json({ error: 'Medical record not found' });
        return;
      }

      // Check if requester is the owner
      const isOwner = record.accessControl.some(
        (ac: any) => ac.userId.toString() === req.user?.userId && ac.accessLevel === RecordAccessLevel.OWNER
      );

      if (!isOwner) {
        res.status(403).json({ error: 'Only the owner can revoke access' });
        return;
      }

      // Remove access (but can't revoke owner access)
      record.accessControl = record.accessControl.filter(
        (ac: any) => ac.userId.toString() !== userId || ac.accessLevel === RecordAccessLevel.OWNER
      );

      await record.save();

      res.json({ message: 'Access revoked successfully', record });
    } catch (error: any) {
      console.error('Revoke access error:', error);
      res.status(500).json({ error: 'Failed to revoke access', details: error.message });
    }
  }
}
