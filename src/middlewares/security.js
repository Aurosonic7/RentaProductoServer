import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const helmetMiddleware = helmet();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //! 15 minutos
  max: 100, //! Limite de 100 solicitudes por IP
  message: 'Too many requests from this IP, please try again after 15 minutes',
  statusCode: 429
});

export { helmetMiddleware, limiter };