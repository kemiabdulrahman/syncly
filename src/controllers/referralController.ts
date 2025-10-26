import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import Referral from '../models/Referral.ts';
import Case from '../models/Case.ts';
import { ReferralStatus, CaseStatus } from '../types/index.ts';

export class ReferralController {
  static async createReferral(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { caseId, patient, toProvider, reason, urgency, notes } = req.body;

      if (!caseId || !patient || !toProvider || !reason) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Verify case exists
      const caseData = await Case.findById(caseId);
      if (!caseData) {
        res.status(404).json({ error: 'Case not found' });
        return;
      }

      const referral = await Referral.create({
        case: caseId,
        patient,
        fromProvider: req.user?.userId,
        toProvider,
        reason,
        urgency,
        notes,
        status: ReferralStatus.PENDING
      });

      // Update case status
      await Case.findByIdAndUpdate(caseId, {
        status: CaseStatus.PENDING_REFERRAL
      });

      res.status(201).json({ message: 'Referral created successfully', referral });
    } catch (error: any) {
      console.error('Create referral error:', error);
      res.status(500).json({ error: 'Failed to create referral', details: error.message });
    }
  }

  static async getReferrals(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, incoming, outgoing, limit = 50, skip = 0 } = req.query;

      let query: any = {};

      if (status) {
        query.status = status;
      }

      if (incoming === 'true') {
        query.toProvider = req.user?.userId;
      }

      if (outgoing === 'true') {
        query.fromProvider = req.user?.userId;
      }

      const referrals = await Referral.find(query)
        .populate('case', 'caseId title priority')
        .populate('patient', 'firstName lastName patientId')
        .populate('fromProvider', 'firstName lastName role specialization')
        .populate('toProvider', 'firstName lastName role specialization')
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ createdAt: -1 });

      const total = await Referral.countDocuments(query);

      res.json({ referrals, total });
    } catch (error: any) {
      console.error('Get referrals error:', error);
      res.status(500).json({ error: 'Failed to fetch referrals', details: error.message });
    }
  }

  static async getReferralById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const referral = await Referral.findById(id)
        .populate('case')
        .populate('patient')
        .populate('fromProvider', 'firstName lastName role specialization')
        .populate('toProvider', 'firstName lastName role specialization');

      if (!referral) {
        res.status(404).json({ error: 'Referral not found' });
        return;
      }

      res.json({ referral });
    } catch (error: any) {
      console.error('Get referral error:', error);
      res.status(500).json({ error: 'Failed to fetch referral', details: error.message });
    }
  }

  static async respondToReferral(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, responseNotes } = req.body;

      if (!status || ![ReferralStatus.ACCEPTED, ReferralStatus.REJECTED].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const referral = await Referral.findById(id);

      if (!referral) {
        res.status(404).json({ error: 'Referral not found' });
        return;
      }

      // Verify user is the recipient
      if (referral.toProvider.toString() !== req.user?.userId) {
        res.status(403).json({ error: 'Not authorized to respond to this referral' });
        return;
      }

      referral.status = status;
      referral.responseNotes = responseNotes;
      referral.respondedAt = new Date();

      await referral.save();

      // Update case if accepted
      if (status === ReferralStatus.ACCEPTED) {
        await Case.findByIdAndUpdate(referral.case, {
          $push: { assignedTo: req.user?.userId },
          status: CaseStatus.IN_PROGRESS
        });
      }

      res.json({ message: 'Referral response recorded successfully', referral });
    } catch (error: any) {
      console.error('Respond to referral error:', error);
      res.status(500).json({ error: 'Failed to respond to referral', details: error.message });
    }
  }

  static async completeReferral(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const referral = await Referral.findById(id);

      if (!referral) {
        res.status(404).json({ error: 'Referral not found' });
        return;
      }

      // Verify user is involved in the referral
      if (referral.toProvider.toString() !== req.user?.userId &&
          referral.fromProvider.toString() !== req.user?.userId) {
        res.status(403).json({ error: 'Not authorized to complete this referral' });
        return;
      }

      referral.status = ReferralStatus.COMPLETED;
      referral.completedAt = new Date();

      await referral.save();

      res.json({ message: 'Referral marked as completed', referral });
    } catch (error: any) {
      console.error('Complete referral error:', error);
      res.status(500).json({ error: 'Failed to complete referral', details: error.message });
    }
  }
}
