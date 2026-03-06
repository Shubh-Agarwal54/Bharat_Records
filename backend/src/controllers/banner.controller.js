import Banner from '../models/Banner.model.js';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../utils/s3.utils.js';
import multer from 'multer';

// Enrich banners that were uploaded to S3 with a fresh presigned URL (1 hour TTL)
const withPresignedUrls = async (banners) => {
  return Promise.all(
    banners.map(async (b) => {
      const plain = b.toObject();
      if (plain.s3Key) {
        try {
          plain.imageUrl = await getSignedUrl(plain.s3Key, 3600);
        } catch (_) { /* keep stored URL on error */ }
      }
      return plain;
    })
  );
};

// Multer config – memory storage (buffer uploaded to S3)
export const bannerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, or GIF images are allowed'));
    }
  }
});

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /api/banners  →  active banners sorted by order
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    const data = await withPresignedUrls(banners);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

// GET /api/admin/banners  →  all banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    const data = await withPresignedUrls(banners);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// POST /api/admin/banners  →  create banner (file OR imageUrl)
export const createBanner = async (req, res) => {
  try {
    const { title = '', imageUrl, linkUrl = '', order = 0 } = req.body;

    let finalImageUrl = imageUrl;
    let s3Key = null;

    if (req.file) {
      // File was uploaded – push to S3
      const ext = req.file.originalname.split('.').pop();
      const key = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      finalImageUrl = await uploadToS3(req.file.buffer, key, req.file.mimetype);
      s3Key = key;
    }

    if (!finalImageUrl) {
      return res.status(400).json({ success: false, message: 'Provide an image file or image URL' });
    }

    const banner = await Banner.create({
      title,
      imageUrl: finalImageUrl,
      s3Key,
      linkUrl,
      order: Number(order)
    });

    res.status(201).json({ success: true, data: banner, message: 'Banner created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/banners/:id/toggle  →  toggle isActive
export const toggleBannerActive = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ success: true, data: banner, message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/banners/:id/order  →  update order
export const updateBannerOrder = async (req, res) => {
  try {
    const { order } = req.body;
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { order: Number(order) },
      { new: true }
    );
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/banners/:id
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    // Remove from S3 if uploaded there
    if (banner.s3Key) {
      try { await deleteFromS3(banner.s3Key); } catch (_) {}
    }

    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
