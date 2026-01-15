import express from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  getDocumentDownloadUrl
} from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png').split(',');
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${fileExt} not allowed`));
    }
  }
});

// Protect all routes
router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.get('/stats/categories', getDocumentStats);
router.get('/:id', getDocumentById);
router.get('/:id/download', getDocumentDownloadUrl);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
