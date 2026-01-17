import Nominee from '../models/Nominee.model.js';
import User from '../models/User.model.js';
import crypto from 'crypto';
import { sendNomineeInvitation } from '../utils/email.utils.js';

// @desc    Create new nominee
// @route   POST /api/nominees
// @access  Private
export const createNominee = async (req, res) => {
  try {
    const {
      fullName,
      relationship,
      dateOfBirth,
      aadhaarNumber,
      panNumber,
      mobileNumber,
      email,
      address,
      sharePercentage,
      notes
    } = req.body;

    // Validate required fields
    if (!fullName || !relationship || !dateOfBirth) {
      return res.status(400).json({
        status: 'error',
        message: 'Full name, relationship, and date of birth are required'
      });
    }

    // Check total share percentage doesn't exceed 100%
    const existingNominees = await Nominee.find({ 
      user: req.user._id, 
      isActive: true 
    });
    
    const totalShare = existingNominees.reduce((sum, nom) => sum + (nom.sharePercentage || 0), 0);
    
    if (totalShare + (sharePercentage || 0) > 100) {
      return res.status(400).json({
        status: 'error',
        message: `Total share percentage cannot exceed 100%. Current total: ${totalShare}%`
      });
    }

    const nominee = await Nominee.create({
      user: req.user._id,
      fullName,
      relationship,
      dateOfBirth,
      aadhaarNumber,
      panNumber,
      mobileNumber,
      email,
      address,
      sharePercentage: sharePercentage || 0,
      notes
    });

    res.status(201).json({
      status: 'success',
      message: 'Nominee created successfully',
      data: { nominee }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all nominees for user
// @route   GET /api/nominees
// @access  Private
export const getNominees = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const query = { user: req.user._id };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const nominees = await Nominee.find(query).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: nominees.length,
      data: { nominees }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get nominee by ID
// @route   GET /api/nominees/:id
// @access  Private
export const getNomineeById = async (req, res) => {
  try {
    const nominee = await Nominee.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!nominee) {
      return res.status(404).json({
        status: 'error',
        message: 'Nominee not found'
      });
    }

    res.json({
      status: 'success',
      data: { nominee }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update nominee
// @route   PUT /api/nominees/:id
// @access  Private
export const updateNominee = async (req, res) => {
  try {
    const nominee = await Nominee.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!nominee) {
      return res.status(404).json({
        status: 'error',
        message: 'Nominee not found'
      });
    }

    // If updating share percentage, check total doesn't exceed 100%
    if (req.body.sharePercentage !== undefined) {
      const existingNominees = await Nominee.find({ 
        user: req.user._id, 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      const totalShare = existingNominees.reduce((sum, nom) => sum + (nom.sharePercentage || 0), 0);
      
      if (totalShare + req.body.sharePercentage > 100) {
        return res.status(400).json({
          status: 'error',
          message: `Total share percentage cannot exceed 100%. Current total (excluding this nominee): ${totalShare}%`
        });
      }
    }

    const updatedNominee = await Nominee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Nominee updated successfully',
      data: { nominee: updatedNominee }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete nominee (soft delete)
// @route   DELETE /api/nominees/:id
// @access  Private
export const deleteNominee = async (req, res) => {
  try {
    const nominee = await Nominee.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!nominee) {
      return res.status(404).json({
        status: 'error',
        message: 'Nominee not found'
      });
    }

    // Soft delete
    nominee.isActive = false;
    await nominee.save();

    res.json({
      status: 'success',
      message: 'Nominee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get nominee statistics
// @route   GET /api/nominees/stats/summary
// @access  Private
export const getNomineeStats = async (req, res) => {
  try {
    const nominees = await Nominee.find({ 
      user: req.user._id, 
      isActive: true 
    });

    const stats = {
      totalNominees: nominees.length,
      totalShareAllocated: nominees.reduce((sum, nom) => sum + (nom.sharePercentage || 0), 0),
      shareRemaining: 100 - nominees.reduce((sum, nom) => sum + (nom.sharePercentage || 0), 0),
      byRelationship: {}
    };

    // Group by relationship
    nominees.forEach(nominee => {
      if (!stats.byRelationship[nominee.relationship]) {
        stats.byRelationship[nominee.relationship] = {
          count: 0,
          totalShare: 0
        };
      }
      stats.byRelationship[nominee.relationship].count++;
      stats.byRelationship[nominee.relationship].totalShare += nominee.sharePercentage || 0;
    });

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

// @desc    Send access invitation to nominee
// @route   POST /api/nominees/:id/invite
// @access  Private
export const inviteNominee = async (req, res) => {
  try {
    const { accessLevel, canViewCategories, expiresInDays } = req.body;

    const nominee = await Nominee.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!nominee) {
      return res.status(404).json({
        status: 'error',
        message: 'Nominee not found'
      });
    }

    if (!nominee.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Nominee must have an email address to receive invitation'
      });
    }

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    nominee.hasAccess = true;
    nominee.accessLevel = accessLevel || 'view';
    nominee.inviteStatus = 'pending';
    nominee.inviteToken = inviteToken;
    nominee.inviteSentAt = new Date();
    nominee.canViewCategories = canViewCategories || ['personal', 'investment', 'insurance', 'loans', 'retirement'];
    
    if (expiresInDays) {
      nominee.accessExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    await nominee.save();

    // Send email invitation
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/nominee-invite/${inviteToken}`;
    
    try {
      const emailResult = await sendNomineeInvitation(
        nominee.email,
        nominee.fullName,
        req.user.fullName,
        inviteLink,
        nominee.accessLevel,
        nominee.canViewCategories
      );

      res.json({
        status: 'success',
        message: 'Invitation sent successfully',
        data: { 
          nominee,
          emailSent: emailResult.success,
          // Only include invite link in development mode
          ...(process.env.NODE_ENV !== 'production' && { inviteLink: emailResult.inviteLink })
        }
      });
    } catch (emailError) {
      // Email failed but invitation created - still return success
      console.error('Email send failed:', emailError);
      res.json({
        status: 'success',
        message: 'Invitation created but email failed to send',
        data: { 
          nominee,
          emailSent: false,
          inviteLink // Return link so owner can manually share it
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Accept nominee invitation and link account
// @route   POST /api/nominees/accept-invite/:token
// @access  Public (but requires token)
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { userId } = req.body; // User ID from logged-in user accepting invite

    const nominee = await Nominee.findOne({
      inviteToken: token,
      inviteStatus: 'pending'
    }).populate('user', 'fullName email');

    if (!nominee) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid or expired invitation'
      });
    }

    // Check if access has expired
    if (nominee.accessExpiresAt && nominee.accessExpiresAt < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'This invitation has expired'
      });
    }

    nominee.inviteStatus = 'accepted';
    nominee.linkedUser = userId;
    nominee.linkedAt = new Date();
    nominee.inviteToken = undefined; // Clear token after acceptance
    
    await nominee.save();

    res.json({
      status: 'success',
      message: 'Invitation accepted successfully',
      data: { 
        nominee,
        accountOwner: nominee.user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Revoke nominee access
// @route   PUT /api/nominees/:id/revoke
// @access  Private
export const revokeNomineeAccess = async (req, res) => {
  try {
    const nominee = await Nominee.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!nominee) {
      return res.status(404).json({
        status: 'error',
        message: 'Nominee not found'
      });
    }

    nominee.hasAccess = false;
    nominee.inviteStatus = 'revoked';
    nominee.accessLevel = 'none';
    
    await nominee.save();

    res.json({
      status: 'success',
      message: 'Nominee access revoked successfully',
      data: { nominee }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get accounts where current user is a nominee
// @route   GET /api/nominees/my-access
// @access  Private
export const getMyNomineeAccess = async (req, res) => {
  try {
    const nominees = await Nominee.find({
      linkedUser: req.user._id,
      hasAccess: true,
      inviteStatus: 'accepted',
      isActive: true
    }).populate('user', 'fullName email profilePicture mobile');

    // Filter out expired access
    const activeNominees = nominees.filter(nom => {
      if (!nom.accessExpiresAt) return true;
      return nom.accessExpiresAt > new Date();
    });

    res.json({
      status: 'success',
      count: activeNominees.length,
      data: { accounts: activeNominees }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update nominee last access time
// @route   PATCH /api/nominees/:id/access-log
// @access  Private
export const logNomineeAccess = async (req, res) => {
  try {
    const nominee = await Nominee.findOne({
      _id: req.params.id,
      linkedUser: req.user._id,
      hasAccess: true,
      inviteStatus: 'accepted'
    });

    if (!nominee) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    nominee.lastAccessedAt = new Date();
    await nominee.save();

    res.json({
      status: 'success',
      message: 'Access logged'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

