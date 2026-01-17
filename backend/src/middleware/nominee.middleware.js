import Document from '../models/Document.model.js';
import Nominee from '../models/Nominee.model.js';

// Middleware to check if user has access to documents as nominee
export const checkNomineeAccess = async (req, res, next) => {
  try {
    const { accountId } = req.query;

    // If no accountId, user is accessing their own documents
    if (!accountId) {
      return next();
    }

    // Check if user has nominee access to this account
    const nomineeAccess = await Nominee.findOne({
      _id: accountId,
      linkedUser: req.user._id,
      hasAccess: true,
      inviteStatus: 'accepted',
      isActive: true
    }).populate('user');

    if (!nomineeAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have access to this account'
      });
    }

    // Check if access has expired
    if (nomineeAccess.accessExpiresAt && nomineeAccess.accessExpiresAt < new Date()) {
      return res.status(403).json({
        status: 'error',
        message: 'Your access to this account has expired'
      });
    }

    // Store nominee access info in request for use in controller
    req.nomineeAccess = {
      accountOwnerId: nomineeAccess.user._id,
      accessLevel: nomineeAccess.accessLevel,
      canViewCategories: nomineeAccess.canViewCategories,
      nomineeId: nomineeAccess._id
    };

    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get documents with nominee access support
export const getDocumentsWithNomineeAccess = async (req, res) => {
  try {
    const { category, documentType, search } = req.query;

    // Determine which user's documents to fetch
    const userId = req.nomineeAccess ? req.nomineeAccess.accountOwnerId : req.user._id;

    const query = {
      user: userId,
      isDeleted: false
    };

    // If accessing as nominee, filter by allowed categories
    if (req.nomineeAccess) {
      query.category = { $in: req.nomineeAccess.canViewCategories };
    }

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
      data: { 
        documents,
        accessInfo: req.nomineeAccess ? {
          accessLevel: req.nomineeAccess.accessLevel,
          isNomineeAccess: true
        } : {
          isNomineeAccess: false
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
