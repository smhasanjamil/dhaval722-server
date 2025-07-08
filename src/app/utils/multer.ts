// src/utils/multer.ts
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() }); // store XLSX in memory

export default upload;
