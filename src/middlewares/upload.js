import multer from 'multer';
import { Dropbox } from 'dropbox';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const dbx = new Dropbox({ accessToken: config.dropbox.accessToken });
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png/;

const sanitizeName = (name) => {
  return name
    ? name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
    : 'unknown_name';
};

const createFileName = (baseName, extension) => {
  const timestamp = Date.now();
  const sanitizedBase = sanitizeName(baseName);
  return `${sanitizedBase}_${timestamp}.${extension}`;
};

const uploadToDropbox = async (fileBuffer, imageName) => {
  const dropboxPath = `/productos/${imageName}`;
  await dbx.filesUpload({ path: dropboxPath, contents: fileBuffer });
  return dropboxPath;
};

const getDropboxImageLink = async (path) => {
  try {
    const linkResponse = await dbx.sharingCreateSharedLinkWithSettings({ path });
    const directLink = linkResponse.result.url.replace("?dl=0", "?raw=1");
    logger.info(`Generated Dropbox link: ${directLink}`);
    return directLink;
  } catch (error) {
    logger.error(`Error generating Dropbox link for path ${path}: ${error.message}`); //! Analizar el error debido a que no se generó el enlace
    return null;
  }
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
  const extname = ALLOWED_FILE_TYPES.test(file.originalname.toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Solo se permiten imágenes con extensiones JPEG, JPG y PNG'));
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export { dbx, upload, uploadToDropbox, createFileName, getDropboxImageLink };