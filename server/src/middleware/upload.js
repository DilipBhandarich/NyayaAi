import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/env.js';
import ApiError from '../utils/apiError.js';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseId = req.params.id;
    const uploadPath = path.join(config.UPLOAD_DIR, caseId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${ext} is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
});
