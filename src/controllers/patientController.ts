import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Patient from '../models/Patient.js';

export class PatientController {
  static async createPatient(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { firstName, lastName, dateOfBirth, gender, bloodType, allergies, chronicConditions, emergencyContact } = req.body;

      if (!firstName || !lastName || !dateOfBirth || !gender || !emergencyContact) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const patient = await Patient.create({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        bloodType,
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        emergencyContact,
        createdBy: req.user?.userId
      });

      res.status(201).json({ message: 'Patient created successfully', patient });
    } catch (error: any) {
      console.error('Create patient error:', error);
      res.status(500).json({ error: 'Failed to create patient', details: error.message });
    }
  }

  static async getPatients(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { search, limit = 50, skip = 0 } = req.query;

      let query: any = {};

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { patientId: { $regex: search, $options: 'i' } }
        ];
      }

      const patients = await Patient.find(query)
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ createdAt: -1 });

      const total = await Patient.countDocuments(query);

      res.json({ patients, total });
    } catch (error: any) {
      console.error('Get patients error:', error);
      res.status(500).json({ error: 'Failed to fetch patients', details: error.message });
    }
  }

  static async getPatientById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const patient = await Patient.findById(id);

      if (!patient) {
        res.status(404).json({ error: 'Patient not found' });
        return;
      }

      res.json({ patient });
    } catch (error: any) {
      console.error('Get patient error:', error);
      res.status(500).json({ error: 'Failed to fetch patient', details: error.message });
    }
  }

  static async updatePatient(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated
      delete updates.patientId;
      delete updates.createdBy;

      const patient = await Patient.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!patient) {
        res.status(404).json({ error: 'Patient not found' });
        return;
      }

      res.json({ message: 'Patient updated successfully', patient });
    } catch (error: any) {
      console.error('Update patient error:', error);
      res.status(500).json({ error: 'Failed to update patient', details: error.message });
    }
  }

  static async deletePatient(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const patient = await Patient.findByIdAndDelete(id);

      if (!patient) {
        res.status(404).json({ error: 'Patient not found' });
        return;
      }

      res.json({ message: 'Patient deleted successfully' });
    } catch (error: any) {
      console.error('Delete patient error:', error);
      res.status(500).json({ error: 'Failed to delete patient', details: error.message });
    }
  }
}
