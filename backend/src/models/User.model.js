import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  clientId: {
    type: String,
    unique: true,
    sparse: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  dob: {
    type: Date
  },
  aadhaarNumber: {
    type: String,
    trim: true
  },
  panNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCount: {
    type: Number,
    default: 0
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    biometricEnabled: {
      type: Boolean,
      default: false
    },
    lastPasswordChange: {
      type: Date
    }
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    device: String
  }],
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

// Generate client ID before save
userSchema.pre('save', async function(next) {
  if (!this.clientId) {
    try {
      // Find the last clientId and increment
      const lastUser = await mongoose.model('User').findOne({}, { clientId: 1 }).sort({ clientId: -1 }).limit(1);
      
      if (lastUser && lastUser.clientId) {
        const lastNumber = parseInt(lastUser.clientId.replace('BR', ''));
        this.clientId = `BR${String(lastNumber + 1).padStart(6, '0')}`;
      } else {
        this.clientId = `BR010001`;
      }
    } catch (error) {
      // Fallback to timestamp-based unique ID if there's an error
      this.clientId = `BR${Date.now().toString().slice(-6)}`;
    }
  }
  
  if (!this.referralCode) {
    this.referralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
  
  next();
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
