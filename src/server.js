import express from 'express';
import morgan from 'morgan';
import logger from './utils/logger.js';
import cors from './middlewares/cors.js';
import { helmetMiddleware, limiter } from './middlewares/security.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import productoRoutes from './routes/producto.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import rentaRoutes from './routes/renta.routes.js';
import productoxrentaRoutes from './routes/productoxrenta.routes.js';
import metodoPagoRoutes from './routes/metodoPago.routes.js';

import { spawn } from 'child_process';

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
server.use('/api/usuarios', usuarioRoutes);
server.use('/api/rentas', rentaRoutes);
server.use('/api/productoxrenta', productoxrentaRoutes);
server.use('/api/metodopago', metodoPagoRoutes);

//! Agregar un middleware para manejar errores 404 y 500
server.use(notFoundHandler);
server.use(errorHandler);

// // Función para iniciar y escuchar un script Python
// function startPythonScript(scriptPath, scriptName) {
//   const venvPath = 'D:/La_salle_oaxaca/Ejercicios_de_Python/Proyectos_personales/flask-aws-rekognition/venv/Scripts/activate';
//   const pythonPath = 'D:/La_salle_oaxaca/Ejercicios_de_Python/Proyectos_personales/flask-aws-rekognition/venv/Scripts/python.exe';

//   // Ejecutar el script dentro del entorno virtual
//   const pythonProcess = spawn('cmd', ['/c', `call ${venvPath} && ${pythonPath} ${scriptPath}`]);

//   console.log(`Iniciando script Python: ${scriptName}`);

//   // Escuchar datos de salida
//   pythonProcess.stdout.on('data', (data) => {
//     console.log(`[${scriptName}] Salida: ${data.toString()}`);
//   });

//   // Escuchar errores
//   pythonProcess.stderr.on('data', (data) => {
//     console.error(`[${scriptName}] Error: ${data.toString()}`);
//   });

//   // Escuchar cuando el proceso finaliza
//   pythonProcess.on('close', (code) => {
//     console.log(`[${scriptName}] Proceso finalizado con código ${code}`);
//   });
// }

// //! Ejecutar ambos scripts Python al iniciar el servidor
// startPythonScript(
//   'D:/La_salle_oaxaca/Ejercicios_de_Python/Proyectos_personales/flask-aws-rekognition/backend.py',
//   'Backend Script'
// );
// startPythonScript(
//   'D:/La_salle_oaxaca/Ejercicios_de_Python/Proyectos_personales/flask-aws-rekognition/putimages.py',
//   'PutImages Script'
// );

export default server;