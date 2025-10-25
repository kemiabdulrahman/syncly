import dotenv from 'dotenv';
import { App } from './app.js';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  try {
    const app = new App();

    await app.initialize();

    app.listen(PORT);

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n👋 SIGTERM received, shutting down gracefully...');
      app.getHttpServer().close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n👋 SIGINT received, shutting down gracefully...');
      app.getHttpServer().close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();