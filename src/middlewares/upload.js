import multer from 'multer';
import crypto from 'crypto';
import { Dropbox } from 'dropbox';
import fs from 'fs';
import config from '../config/config.js';

// Configuración de Dropbox
const dbx = new Dropbox({ accessToken: config.dropbox.accessToken });
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png/;

// Función para eliminar acentos y caracteres especiales
const sanitizeName = (name) => {
  return name
    .normalize("NFD") // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-zA-Z0-9]/g, "_") // Remover caracteres especiales
    .toLowerCase(); // Convertir a minúsculas
};

// Función para crear un nombre de archivo personalizado con extensión al final
const createFileName = (originalName, extension) => {
  const timestamp = Date.now();
  const baseName = sanitizeName(originalName);
  return `${baseName}_${timestamp}.${extension}`;
};

// Configuración de almacenamiento en memoria para multer
const storage = multer.memoryStorage();

// Filtro de archivos para aceptar solo imágenes válidas
const fileFilter = (req, file, cb) => {
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
  const extname = ALLOWED_FILE_TYPES.test(file.originalname.toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Solo se permiten imágenes con extensiones JPEG, JPG y PNG'));
};

// Función para cargar imagen a Dropbox con un nombre completo (incluyendo extensión)
const uploadToDropbox = async (fileBuffer, fullFileName) => {
  const dropboxPath = `/productos/${fullFileName}`;
  await dbx.filesUpload({ path: dropboxPath, contents: fileBuffer });
  return dropboxPath; // Retorna la ruta del archivo en Dropbox
};

// Configuración de multer
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export { dbx, upload, uploadToDropbox, createFileName };