import express, { Application } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectDatabase } from './config/database.js';
import { SocketService } from './services/socketService.js';
import { NotificationService } from './services/notificationService.js';
import { setNotificationService } from './controllers/notificationController.js';

// Import Swagger
import { swaggerUi, swaggerSpec } from './swagger/index.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

export class App {
  public app: Application;
  private httpServer;
  public socketService: SocketService;
  public notificationService: NotificationService;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.socketService = new SocketService(this.httpServer);
    this.notificationService = new NotificationService();

    this.initializeMiddleware();
    this.initializeRoutes();
  }

  private initializeMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: process.env.CLIENT_URL || '*',
      credentials: true
    }));

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging (simple)
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Swagger API Documentation
    this.app.use('/api-docs', swaggerUi.serve);
    this.app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Telemedicine Platform API',
      customfavIcon: '/favicon.ico'
    }));

    // Swagger JSON endpoint
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/patients', patientRoutes);
    this.app.use('/api/cases', caseRoutes);
    this.app.use('/api/discussions', discussionRoutes);
    this.app.use('/api/medical-records', medicalRecordRoutes);
    this.app.use('/api/referrals', referralRoutes);
    this.app.use('/api/emergency', emergencyRoutes);
    this.app.use('/api/notifications', notificationRoutes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  public async initialize(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Initialize notification service
      await this.notificationService.initialize(this.socketService);
      setNotificationService(this.notificationService);

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  public listen(port: number): void {
    this.httpServer.listen(port, () => {
      console.log(`\n🚀 Telemedicine Platform Server`);
      console.log(`   HTTP Server: http://localhost:${port}`);
      console.log(`   WebSocket Server: ws://localhost:${port}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n📚 API Documentation:`);
      console.log(`   Swagger UI: http://localhost:${port}/api-docs`);
      console.log(`   OpenAPI JSON: http://localhost:${port}/api-docs.json`);
      console.log(`\n📋 Quick Access:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /api/auth/register - Register new healthcare worker`);
      console.log(`   POST /api/auth/login - Login`);
      console.log(`   GET  /api/auth/profile - Get user profile\n`);
    });
  }

  public getHttpServer() {
    return this.httpServer;
  }
}
