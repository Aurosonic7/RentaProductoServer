import { createLogger, transports, format } from 'winston';
import fs from 'fs';
import path from 'path';

//! Crear la carpeta 'logs' si no existe
const logDirectory = path.resolve('logs');
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf(({ timestamp, level, message, stack }) => { return `${timestamp} ${level}: ${stack || message}`; })
      )
    }),
    new transports.File({ filename: path.join(logDirectory, 'server.log') })
  ],
  exceptionHandlers: [new transports.File({ filename: path.join(logDirectory, 'exceptions.log') })],
  rejectionHandlers: [new transports.File({ filename: path.join(logDirectory, 'rejections.log') })]
});

export default logger;