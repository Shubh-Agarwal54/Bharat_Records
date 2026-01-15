import Document from '../models/Document.model.js';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../utils/s3.utils.js';
import path from 'path';

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    const { category, documentType, title, metadata } = req.body;
    
    // Upload to S3
    const fileExt = path.extname(req.file.originalname).substring(1);
    const fileName = `${req.user._id}/${category}/${documentType}_${Date.now()}.${fileExt}`;
    
    const s3Url = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);
    
    // Create document record
    const document = await Document.create({
      user: req.user._id,
      category,
      documentType,
      title,
      fileName: req.file.originalname,
      fileUrl: s3Url,
      fileType: fileExt,
      fileSize: req.file.size,
      s3Key: fileName,
      metadata: metadata ? JSON.parse(metadata) : {}
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: { document }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res) => {
  try {
    const { category, documentType, search } = req.query;
    
    const query = {
      user: req.user._id,
      isDeleted: false
    };
    
    if (category) query.category = category;
    if (documentType) query.documentType = documentType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const documents = await Document.find(query).sort({ uploadDate: -1 });
    
    res.json({
      status: 'success',
      count: documents.length,
      data: { documents }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }
    
    // Generate signed URL for secure access
    const signedUrl = await getSignedUrl(document.s3Key);
    
    res.json({
      status: 'success',
      data: {
        document: {
          ...document.toObject(),
          signedUrl
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res) => {
  try {
    const { title, metadata, tags } = req.body;
    
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }
    
    if (title) document.title = title;
    if (metadata) document.metadata = { ...document.metadata, ...metadata };
    if (tags) document.tags = tags;
    
    await document.save();
    
    res.json({
      status: 'success',
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }
    
    // Soft delete
    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save();
    
    res.json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get document categories with counts
// @route   GET /api/documents/stats/categories
// @access  Private
export const getDocumentStats = async (req, res) => {
  try {
    const stats = await Document.aggregate([
      {
        $match: {
          user: req.user._id,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);
    
    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get signed URL for document download
// @route   GET /api/documents/:id/download
// @access  Private
export const getDocumentDownloadUrl = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }
    
    // Generate signed URL valid for 1 hour
    const signedUrl = await getSignedUrl(document.s3Key, 3600);
    
    res.json({
      status: 'success',
      data: { 
        signedUrl,
        fileName: document.fileName
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
