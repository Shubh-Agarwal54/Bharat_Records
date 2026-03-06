import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Sections of the admin panel that can have per-section permissions
const SECTIONS = [
  'dashboard',
  'users',
  'documents',
  'transactions',
  'wallets',
  'helpQueries',
  'banners',
  'adminRoles',
];

// Build a default permissions sub-doc: all false
const buildDefaultPermissions = () => {
  const perms = {};
  SECTIONS.forEach(s => {
    perms[s] = { view: false, edit: false, manage: false, delete: false };
  });
  return perms;
};

const permissionSectionSchema = new mongoose.Schema(
  {
    view:   { type: Boolean, default: false },
    edit:   { type: Boolean, default: false },
    manage: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const permissionsSchema = new mongoose.Schema(
  Object.fromEntries(SECTIONS.map(s => [s, { type: permissionSectionSchema, default: () => ({}) }])),
  { _id: false }
);

const adminAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'sub-admin', 'master-admin', 'super-admin'],
      default: 'sub-admin',
    },
    permissions: {
      type: permissionsSchema,
      default: buildDefaultPermissions,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminAccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminAccountSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const ADMIN_SECTIONS = SECTIONS;
export default mongoose.model('AdminAccount', adminAccountSchema);
