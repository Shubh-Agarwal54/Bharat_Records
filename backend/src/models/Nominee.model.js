import mongoose from 'mongoose';

const nomineeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Nominee name is required'],
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: ['spouse', 'parent', 'child', 'sibling', 'other']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  aadhaarNumber: {
    type: String,
    trim: true,
    sparse: true,
    validate: {
      validator: function(v) {
        // Skip validation if field is undefined, null, or empty string
        if (v === undefined || v === null || v === '') return true;
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhaar number must be exactly 12 digits'
    }
  },
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true,
    validate: {
      validator: function(v) {
        // Skip validation if field is undefined, null, or empty string
        if (v === undefined || v === null || v === '') return true;
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'PAN must be in format: ABCDE1234F'
    }
  },
  mobileNumber: {
    type: String,
    trim: true,
    sparse: true,
    validate: {
      validator: function(v) {
        // Skip validation if field is undefined, null, or empty string
        if (v === undefined || v === null || v === '') return true;
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    validate: {
      validator: function(v) {
        // Skip validation if field is undefined, null, or empty string
        if (v === undefined || v === null || v === '') return true;
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  sharePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: [{
    documentType: String,
    documentUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  // Access Control Fields
  hasAccess: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['none', 'view', 'download', 'full'],
    default: 'none'
  },
  inviteStatus: {
    type: String,
    enum: ['not_invited', 'pending', 'accepted', 'revoked'],
    default: 'not_invited'
  },
  inviteToken: {
    type: String,
    unique: true,
    sparse: true
  },
  inviteSentAt: {
    type: Date
  },
  linkedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  linkedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date
  },
  accessExpiresAt: {
    type: Date
  },
  canViewCategories: [{
    type: String,
    enum: ['personal', 'investment', 'insurance', 'loans', 'retirement']
  }]
}, {
  timestamps: true
});

// Index for faster queries
nomineeSchema.index({ user: 1, isActive: 1 });

const Nominee = mongoose.model('Nominee', nomineeSchema);

export default Nominee;
