import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) {
    console.log('Database is already connected');
    return;
  }

  try {
    const mongoUri = env.MONGODB_URI;
    
    const connection = await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    isConnected = true;
    console.log(`✓ Database connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✓ Database disconnected');
  } catch (error) {
    console.error('✗ Database disconnection failed:', error);
  }
}

export function getConnection() {
  return mongoose.connection;
}
