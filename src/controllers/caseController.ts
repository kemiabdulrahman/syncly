import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Case from '../models/Case';
import Discussion from '../models/Discussion';
import { CaseStatus, CasePriority } from '../types';

export class CaseController {
  static async createCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { patient, title, description, priority, symptoms, assignedTo } = req.body;

      if (!patient || !title || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const caseData = await Case.create({
        patient,
        title,
        description,
        priority: priority || CasePriority.ROUTINE,
        symptoms: symptoms || [],
        assignedTo: assignedTo || [req.user?.userId],
        createdBy: req.user?.userId,
        status: CaseStatus.OPEN
      });

      // Create a discussion for this case
      await Discussion.create({
        case: caseData._id,
        participants: [req.user?.userId, ...(assignedTo || [])],
        messages: []
      });

      res.status(201).json({ message: 'Case created successfully', case: caseData });
    } catch (error: any) {
      console.error('Create case error:', error);
      res.status(500).json({ error: 'Failed to create case', details: error.message });
    }
  }

  static async getCases(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, priority, assignedToMe, limit = 50, skip = 0 } = req.query;

      let query: any = {};

      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority = priority;
      }

      if (assignedToMe === 'true') {
        query.assignedTo = req.user?.userId;
      }

      const cases = await Case.find(query)
        .populate('patient', 'firstName lastName patientId')
        .populate('assignedTo', 'firstName lastName role')
        .populate('createdBy', 'firstName lastName role')
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ priority: 1, createdAt: -1 });

      const total = await Case.countDocuments(query);

      res.json({ cases, total });
    } catch (error: any) {
      console.error('Get cases error:', error);
      res.status(500).json({ error: 'Failed to fetch cases', details: error.message });
    }
  }

  static async getCaseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const caseData = await Case.findById(id)
        .populate('patient')
        .populate('assignedTo', 'firstName lastName role specialization')
        .populate('createdBy', 'firstName lastName role');

      if (!caseData) {
        res.status(404).json({ error: 'Case not found' });
        return;
      }

      res.json({ case: caseData });
    } catch (error: any) {
      console.error('Get case error:', error);
      res.status(500).json({ error: 'Failed to fetch case', details: error.message });
    }
  }

  static async updateCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.caseId;
      delete updates.createdBy;

      const caseData = await Case.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('patient')
        .populate('assignedTo', 'firstName lastName role')
        .populate('createdBy', 'firstName lastName role');

      if (!caseData) {
        res.status(404).json({ error: 'Case not found' });
        return;
      }

      res.json({ message: 'Case updated successfully', case: caseData });
    } catch (error: any) {
      console.error('Update case error:', error);
      res.status(500).json({ error: 'Failed to update case', details: error.message });
    }
  }

  static async assignCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!assignedTo || !Array.isArray(assignedTo)) {
        res.status(400).json({ error: 'assignedTo must be an array of user IDs' });
        return;
      }

      const caseData = await Case.findByIdAndUpdate(
        id,
        { $set: { assignedTo } },
        { new: true }
      ).populate('assignedTo', 'firstName lastName role');

      if (!caseData) {
        res.status(404).json({ error: 'Case not found' });
        return;
      }

      // Update discussion participants
      await Discussion.findOneAndUpdate(
        { case: id },
        { $set: { participants: assignedTo } }
      );

      res.json({ message: 'Case assigned successfully', case: caseData });
    } catch (error: any) {
      console.error('Assign case error:', error);
      res.status(500).json({ error: 'Failed to assign case', details: error.message });
    }
  }

  static async deleteCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const caseData = await Case.findByIdAndDelete(id);

      if (!caseData) {
        res.status(404).json({ error: 'Case not found' });
        return;
      }

      // Delete associated discussion
      await Discussion.deleteOne({ case: id });

      res.json({ message: 'Case deleted successfully' });
    } catch (error: any) {
      console.error('Delete case error:', error);
      res.status(500).json({ error: 'Failed to delete case', details: error.message });
    }
  }
}
