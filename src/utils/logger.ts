import pino from 'pino';
import { env, isDevelopment } from '../config/env.js';

const devTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'pid,hostname',
    singleLine: false,
  },
};

export const logger = pino({
  level: env.LOG_LEVEL,
  // pino-pretty adds ~30% overhead — only use in development
  ...(isDevelopment && { transport: devTransport }),
});
