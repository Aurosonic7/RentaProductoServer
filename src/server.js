import express from 'express';
import morgan from 'morgan';
import logger from './utils/logger.js';
import cors from './middlewares/cors.js';
import { helmetMiddleware, limiter } from './middlewares/security.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import productoRoutes from './routes/producto.routes.js';

//! Crear la instancia de Express
const server = express();

//! Configurar Morgan para usar Winston como stream de salida
server.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
//! Middlewares de seguridad
server.use(helmetMiddleware);
server.use(limiter);
server.use(cors);
//! Middleware para parsear el body de las peticiones
server.use(express.urlencoded({ extended: true, limit: '50mb' }));
server.use(express.json({ limit: '50mb' }));

//! Rutas
server.use('/api/auth', authRoutes);
server.use('/api/categorias', categoriaRoutes);
server.use('/api/productos', productoRoutes);

//! Agregar un middleware para manejar errores 404 y 500
server.use(notFoundHandler);
server.use(errorHandler);

export default server;