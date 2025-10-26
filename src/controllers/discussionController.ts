import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import Discussion from '../models/Discussion.ts';
import Case from '../models/Case.ts';

export class DiscussionController {
  static async getDiscussion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;

      const discussion = await Discussion.findOne({ case: caseId })
        .populate('participants', 'firstName lastName role specialization');

      if (!discussion) {
        res.status(404).json({ error: 'Discussion not found' });
        return;
      }

      res.json({ discussion });
    } catch (error: any) {
      console.error('Get discussion error:', error);
      res.status(500).json({ error: 'Failed to fetch discussion', details: error.message });
    }
  }

  static async addMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const { message } = req.body;

      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Verify case exists
      const caseData = await Case.findById(caseId);
      if (!caseData) {
        res.status(404).json({ error: 'Case not found' });
        return;
      }

      let discussion = await Discussion.findOne({ case: caseId });

      if (!discussion) {
        // Create discussion if it doesn't exist
        discussion = await Discussion.create({
          case: caseId,
          participants: [req.user?.userId],
          messages: []
        });
      }

      // Add message
      discussion.messages.push({
        sender: req.user?.userId!,
        senderName: `${req.user?.email}`,
        message,
        timestamp: new Date(),
        isEdited: false
      });

      // Add user to participants if not already there
      if (!discussion.participants.includes(req.user?.userId!)) {
        discussion.participants.push(req.user?.userId!);
      }

      await discussion.save();

      res.json({ message: 'Message added successfully', discussion });
    } catch (error: any) {
      console.error('Add message error:', error);
      res.status(500).json({ error: 'Failed to add message', details: error.message });
    }
  }

  static async deleteMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { caseId, messageId } = req.params;

      const discussion = await Discussion.findOne({ case: caseId });

      if (!discussion) {
        res.status(404).json({ error: 'Discussion not found' });
        return;
      }

      const messageIndex = discussion.messages.findIndex(
        (msg: any) => msg._id.toString() === messageId
      );

      if (messageIndex === -1) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      // Only allow deletion by the message sender or admin
      if (discussion.messages[messageIndex].sender !== req.user?.userId) {
        res.status(403).json({ error: 'Not authorized to delete this message' });
        return;
      }

      discussion.messages.splice(messageIndex, 1);
      await discussion.save();

      res.json({ message: 'Message deleted successfully', discussion });
    } catch (error: any) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message', details: error.message });
    }
  }
}
