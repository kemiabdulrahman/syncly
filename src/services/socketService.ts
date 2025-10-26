import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { JWTService } from '../utils/jwt.ts';
import HealthcareWorker from '../models/HealthcareWorker.ts';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketService {
  private io: Server;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = JWTService.verifyToken(token);

        // Verify user exists
        const user = await HealthcareWorker.findById(decoded.userId);
        if (!user || !user.isActive) {
          return next(new Error('Authentication error: Invalid user'));
        }

        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId}`);

      // Track user socket
      if (socket.userId) {
        const sockets = this.userSockets.get(socket.userId) || [];
        sockets.push(socket.id);
        this.userSockets.set(socket.userId, sockets);

        // Notify user is online
        this.io.emit('user:online', { userId: socket.userId });
      }

      // Join case discussion rooms
      socket.on('case:join', (caseId: string) => {
        socket.join(`case:${caseId}`);
        console.log(`User ${socket.userId} joined case ${caseId}`);
      });

      socket.on('case:leave', (caseId: string) => {
        socket.leave(`case:${caseId}`);
        console.log(`User ${socket.userId} left case ${caseId}`);
      });

      // Real-time case discussion
      socket.on('case:message', (data: { caseId: string; message: string; senderName: string }) => {
        this.io.to(`case:${data.caseId}`).emit('case:message', {
          caseId: data.caseId,
          message: data.message,
          sender: socket.userId,
          senderName: data.senderName,
          timestamp: new Date()
        });
      });

      // Typing indicators
      socket.on('case:typing', (data: { caseId: string; isTyping: boolean }) => {
        socket.to(`case:${data.caseId}`).emit('case:typing', {
          caseId: data.caseId,
          userId: socket.userId,
          isTyping: data.isTyping
        });
      });

      // Case updates
      socket.on('case:update', (data: { caseId: string; updates: any }) => {
        this.io.to(`case:${data.caseId}`).emit('case:updated', {
          caseId: data.caseId,
          updates: data.updates,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      });

      // Emergency alerts
      socket.on('emergency:join', () => {
        socket.join('emergency:alerts');
      });

      socket.on('emergency:leave', () => {
        socket.leave('emergency:alerts');
      });

      // Referral notifications
      socket.on('referral:join', () => {
        socket.join(`referral:${socket.userId}`);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);

        if (socket.userId) {
          const sockets = this.userSockets.get(socket.userId) || [];
          const filtered = sockets.filter(id => id !== socket.id);

          if (filtered.length === 0) {
            this.userSockets.delete(socket.userId);
            // Notify user is offline
            this.io.emit('user:offline', { userId: socket.userId });
          } else {
            this.userSockets.set(socket.userId, filtered);
          }
        }
      });
    });
  }

  // Public methods to emit events
  public emitToCase(caseId: string, event: string, data: any): void {
    this.io.to(`case:${caseId}`).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  public emitEmergencyAlert(data: any): void {
    this.io.to('emergency:alerts').emit('emergency:alert', data);
  }

  public emitReferralNotification(userId: string, data: any): void {
    this.io.to(`referral:${userId}`).emit('referral:notification', data);
  }

  public broadcastNotification(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
