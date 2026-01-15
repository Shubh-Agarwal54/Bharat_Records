import express from 'express';
import multer from 'multer';
import {
  getProfile,
  updateProfile,
  updateMobile,
  updateEmail,
  changePassword,
  getReferrals
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for profile picture upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Only image files (jpg, jpeg, png, gif) are allowed`));
    }
  }
});

// Protect all routes
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', upload.single('profilePicture'), updateProfile);
router.put('/update-mobile', updateMobile);
router.put('/update-email', updateEmail);
router.put('/change-password', changePassword);
router.get('/referrals', getReferrals);

export default router;
