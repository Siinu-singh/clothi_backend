import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) {
    logger.info('Database is already connected');
    return;
  }

  try {
    const mongoUri = env.MONGODB_URI;
    
    const connection = await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    isConnected = true;
    logger.info({ host: connection.connection.host }, 'Database connected');

    // Connection event listeners for production observability
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });
    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('MongoDB reconnected');
    });
    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    return connection;
  } catch (error) {
    logger.error({ err: error }, 'Database connection failed');
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Database disconnected');
  } catch (error) {
    logger.error({ err: error }, 'Database disconnection failed');
  }
}

export function getConnection() {
  return mongoose.connection;
}
