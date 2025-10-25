import { createClient, RedisClientType } from 'redis';
import { SocketService } from './socketService';

export interface Notification {
  id: string;
  userId: string;
  type: 'case' | 'referral' | 'emergency' | 'message' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private redisClient: RedisClientType | null = null;
  private socketService: SocketService | null = null;

  async initialize(socketService: SocketService): Promise<void> {
    this.socketService = socketService;

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redisClient = createClient({ url: redisUrl });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.redisClient.connect();
      console.log('✅ Redis connected for notifications');
    } catch (error) {
      console.error('Redis connection failed:', error);
      console.log('Continuing without Redis - notifications will be memory-only');
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date()
    };

    // Store in Redis with expiry (30 days)
    if (this.redisClient) {
      try {
        const key = `notifications:${notification.userId}`;
        await this.redisClient.lPush(key, JSON.stringify(fullNotification));
        await this.redisClient.expire(key, 30 * 24 * 60 * 60);
      } catch (error) {
        console.error('Failed to store notification in Redis:', error);
      }
    }

    // Send real-time notification via Socket.io
    if (this.socketService) {
      this.socketService.emitToUser(notification.userId, 'notification', fullNotification);
    }

    return fullNotification;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    if (!this.redisClient) {
      return [];
    }

    try {
      const key = `notifications:${userId}`;
      const notifications = await this.redisClient.lRange(key, 0, limit - 1);

      return notifications.map(n => JSON.parse(n));
    } catch (error) {
      console.error('Failed to get notifications from Redis:', error);
      return [];
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const key = `notifications:${userId}`;
      const notifications = await this.redisClient.lRange(key, 0, -1);

      // Find and update the notification
      for (let i = 0; i < notifications.length; i++) {
        const notif = JSON.parse(notifications[i]);
        if (notif.id === notificationId) {
          notif.read = true;
          await this.redisClient.lSet(key, i, JSON.stringify(notif));
          break;
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const key = `notifications:${userId}`;
      const notifications = await this.redisClient.lRange(key, 0, -1);

      // Update all notifications
      await this.redisClient.del(key);
      for (const notifStr of notifications) {
        const notif = JSON.parse(notifStr);
        notif.read = true;
        await this.redisClient.rPush(key, JSON.stringify(notif));
      }

      await this.redisClient.expire(key, 30 * 24 * 60 * 60);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const key = `notifications:${userId}`;
      const notifications = await this.redisClient.lRange(key, 0, -1);

      // Find and remove the notification
      for (const notifStr of notifications) {
        const notif = JSON.parse(notifStr);
        if (notif.id === notificationId) {
          await this.redisClient.lRem(key, 1, notifStr);
          break;
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!this.redisClient) {
      return 0;
    }

    try {
      const key = `notifications:${userId}`;
      const notifications = await this.redisClient.lRange(key, 0, -1);

      return notifications.filter(n => !JSON.parse(n).read).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Helper methods for common notification types
  async notifyNewCase(userId: string, caseData: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'case',
      title: 'New Case Assigned',
      message: `You have been assigned to case: ${caseData.title}`,
      data: { caseId: caseData._id }
    });
  }

  async notifyNewReferral(userId: string, referralData: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'referral',
      title: 'New Referral',
      message: `You have received a new referral`,
      data: { referralId: referralData._id }
    });
  }

  async notifyEmergencyAlert(userIds: string[], alertData: any): Promise<void> {
    for (const userId of userIds) {
      await this.createNotification({
        userId,
        type: 'emergency',
        title: 'Emergency Alert',
        message: alertData.title,
        data: { alertId: alertData._id }
      });
    }

    // Also broadcast via Socket.io
    if (this.socketService) {
      this.socketService.emitEmergencyAlert(alertData);
    }
  }

  async notifyNewMessage(userId: string, caseId: string, senderName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'message',
      title: 'New Message',
      message: `${senderName} sent a message in a case discussion`,
      data: { caseId }
    });
  }
}
