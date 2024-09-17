import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.resolve('uploads/');
const MAX_FILE_SIZE = 1024 * 1024 * 5; //! 5MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png/;

// Función para limpiar y asegurar el nombre del archivo
const sanitizeFileName = (filename) => { return filename.replace(/[^a-zA-Z0-9.-]/g, '_'); };

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, UPLOADS_DIR); },
    filename: (req, file, cb) => {
        const sanitizedFilename = sanitizeFileName(file.originalname);
        const uniqueSuffix = crypto.randomBytes(6).toString('hex');
        cb(null, `${Date.now()}-${uniqueSuffix}-${sanitizedFilename}`);
    },
});

// Filtro de archivos para aceptar solo imágenes válidas
const fileFilter = (req, file, cb) => {
    const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
    const extname = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Solo se permiten imágenes con extensiones JPEG, JPG y PNG'));
};

// Configuración de multer
const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
});

export default upload;