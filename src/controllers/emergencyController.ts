import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import EmergencyAlert from '../models/EmergencyAlert';
import { CasePriority } from '../types';

export class EmergencyController {
  static async createAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, location, priority, assignedTo, caseId, patient } = req.body;

      if (!title || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const alert = await EmergencyAlert.create({
        title,
        description,
        location,
        priority: priority || CasePriority.EMERGENCY,
        createdBy: req.user?.userId,
        assignedTo: assignedTo || [],
        respondedBy: [],
        status: 'active',
        case: caseId,
        patient
      });

      res.status(201).json({ message: 'Emergency alert created successfully', alert });
    } catch (error: any) {
      console.error('Create alert error:', error);
      res.status(500).json({ error: 'Failed to create emergency alert', details: error.message });
    }
  }

  static async getAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, assignedToMe, limit = 50, skip = 0 } = req.query;

      let query: any = {};

      if (status) {
        query.status = status;
      }

      if (assignedToMe === 'true') {
        query.assignedTo = req.user?.userId;
      }

      const alerts = await EmergencyAlert.find(query)
        .populate('createdBy', 'firstName lastName role')
        .populate('assignedTo', 'firstName lastName role specialization')
        .populate('respondedBy', 'firstName lastName role')
        .populate('patient', 'firstName lastName patientId')
        .populate('case', 'caseId title')
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ priority: 1, createdAt: -1 });

      const total = await EmergencyAlert.countDocuments(query);

      res.json({ alerts, total });
    } catch (error: any) {
      console.error('Get alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch emergency alerts', details: error.message });
    }
  }

  static async getAlertById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const alert = await EmergencyAlert.findById(id)
        .populate('createdBy', 'firstName lastName role')
        .populate('assignedTo', 'firstName lastName role specialization phoneNumber')
        .populate('respondedBy', 'firstName lastName role')
        .populate('patient')
        .populate('case');

      if (!alert) {
        res.status(404).json({ error: 'Emergency alert not found' });
        return;
      }

      res.json({ alert });
    } catch (error: any) {
      console.error('Get alert error:', error);
      res.status(500).json({ error: 'Failed to fetch emergency alert', details: error.message });
    }
  }

  static async respondToAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const alert = await EmergencyAlert.findById(id);

      if (!alert) {
        res.status(404).json({ error: 'Emergency alert not found' });
        return;
      }

      // Add user to respondedBy if not already there
      if (!alert.respondedBy.includes(req.user?.userId!)) {
        alert.respondedBy.push(req.user?.userId!);
      }

      // Update status to responding if still active
      if (alert.status === 'active') {
        alert.status = 'responding';
      }

      await alert.save();

      res.json({ message: 'Response to emergency alert recorded', alert });
    } catch (error: any) {
      console.error('Respond to alert error:', error);
      res.status(500).json({ error: 'Failed to respond to emergency alert', details: error.message });
    }
  }

  static async resolveAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const alert = await EmergencyAlert.findById(id);

      if (!alert) {
        res.status(404).json({ error: 'Emergency alert not found' });
        return;
      }

      alert.status = 'resolved';
      alert.resolvedAt = new Date();

      await alert.save();

      res.json({ message: 'Emergency alert resolved', alert });
    } catch (error: any) {
      console.error('Resolve alert error:', error);
      res.status(500).json({ error: 'Failed to resolve emergency alert', details: error.message });
    }
  }

  static async deleteAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const alert = await EmergencyAlert.findByIdAndDelete(id);

      if (!alert) {
        res.status(404).json({ error: 'Emergency alert not found' });
        return;
      }

      res.json({ message: 'Emergency alert deleted successfully' });
    } catch (error: any) {
      console.error('Delete alert error:', error);
      res.status(500).json({ error: 'Failed to delete emergency alert', details: error.message });
    }
  }
}
