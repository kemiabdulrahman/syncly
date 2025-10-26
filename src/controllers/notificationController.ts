import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { NotificationService } from '../services/notificationService.ts';

let notificationService: NotificationService;

export const setNotificationService = (service: NotificationService) => {
  notificationService = service;
};

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { limit = 50 } = req.query;

      const notifications = await notificationService.getUserNotifications(
        req.user?.userId!,
        Number(limit)
      );

      res.json({ notifications });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount(req.user?.userId!);
      res.json({ count });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count', details: error.message });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await notificationService.markAsRead(req.user?.userId!, id);

      res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read', details: error.message });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user?.userId!);

      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read', details: error.message });
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await notificationService.deleteNotification(req.user?.userId!, id);

      res.json({ message: 'Notification deleted successfully' });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification', details: error.message });
    }
  }
}
