import { Request, Response } from 'express';
import HealthcareWorker from '../models/HealthcareWorker.js';
import { JWTService } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, specialization, licenseNumber, phoneNumber, department } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role || !licenseNumber || !phoneNumber) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Check if user already exists
      const existingUser = await HealthcareWorker.findOne({
        $or: [{ email }, { licenseNumber }]
      });

      if (existingUser) {
        res.status(400).json({ error: 'User with this email or license number already exists' });
        return;
      }

      // Create new user
      const user = await HealthcareWorker.create({
        email,
        password,
        firstName,
        lastName,
        role,
        specialization,
        licenseNumber,
        phoneNumber,
        department
      });

      // Generate token
      const token = JWTService.generateToken({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await HealthcareWorker.findOne({ email });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({ error: 'Account is inactive' });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Update last active
      user.lastActive = new Date();
      await user.save();

      // Generate token
      const token = JWTService.generateToken({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role
      });

      res.json({
        message: 'Login successful',
        token,
        user
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await HealthcareWorker.findById(req.user?.userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { firstName, lastName, phoneNumber, department, specialization } = req.body;

      const user = await HealthcareWorker.findById(req.user?.userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Update fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (department) user.department = department;
      if (specialization) user.specialization = specialization;

      await user.save();

      res.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
  }
}
