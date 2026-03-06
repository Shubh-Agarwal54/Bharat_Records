import AdminAccount, { ADMIN_SECTIONS } from '../models/AdminAccount.model.js';
import jwt from 'jsonwebtoken';

// Helper: generate a short-lived token for a sub-admin login
const generateAdminAccountToken = (account) => {
  return jwt.sign(
    {
      adminAccountId: account._id,
      email: account.email,
      role: account.role,
      permissions: account.permissions,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '8h' }
  );
};

// ─── List all admin accounts ──────────────────────────────────────────────────
// GET /api/admin/admin-accounts
export const getAdminAccounts = async (req, res) => {
  try {
    const accounts = await AdminAccount.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Create admin account ─────────────────────────────────────────────────────
// POST /api/admin/admin-accounts
export const createAdminAccount = async (req, res) => {
  try {
    const { name, email, password, role = 'sub-admin', permissions = {} } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'Email is required' });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const exists = await AdminAccount.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: 'An admin with this email already exists' });

    // Merge provided permissions with defaults (false for unspecified)
    const finalPermissions = {};
    ADMIN_SECTIONS.forEach(section => {
      finalPermissions[section] = {
        view:   !!(permissions[section]?.view),
        edit:   !!(permissions[section]?.edit),
        manage: !!(permissions[section]?.manage),
        delete: !!(permissions[section]?.delete),
      };
    });

    const account = await AdminAccount.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      permissions: finalPermissions,
      createdBy: req.admin?._id || null,
    });

    const safe = account.toObject();
    delete safe.password;

    res.status(201).json({ success: true, data: safe, message: 'Admin account created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update admin account (role + permissions) ────────────────────────────────
// PUT /api/admin/admin-accounts/:id
export const updateAdminAccount = async (req, res) => {
  try {
    const { name, role, permissions, isActive } = req.body;
    const account = await AdminAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: 'Admin account not found' });

    if (name !== undefined) account.name = name.trim();
    if (role !== undefined) account.role = role;
    if (isActive !== undefined) account.isActive = isActive;

    if (permissions) {
      ADMIN_SECTIONS.forEach(section => {
        if (permissions[section]) {
          account.permissions[section] = {
            view:   !!(permissions[section].view),
            edit:   !!(permissions[section].edit),
            manage: !!(permissions[section].manage),
            delete: !!(permissions[section].delete),
          };
        }
      });
      account.markModified('permissions');
    }

    await account.save();

    const safe = account.toObject();
    delete safe.password;
    res.json({ success: true, data: safe, message: 'Admin account updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Toggle active status ─────────────────────────────────────────────────────
// PUT /api/admin/admin-accounts/:id/toggle
export const toggleAdminAccountStatus = async (req, res) => {
  try {
    const account = await AdminAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: 'Admin account not found' });

    account.isActive = !account.isActive;
    await account.save();

    res.json({
      success: true,
      data: { isActive: account.isActive },
      message: `Account ${account.isActive ? 'activated' : 'deactivated'}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Reset password ───────────────────────────────────────────────────────────
// PUT /api/admin/admin-accounts/:id/reset-password
export const resetAdminAccountPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const account = await AdminAccount.findById(req.params.id).select('+password');
    if (!account) return res.status(404).json({ success: false, message: 'Admin account not found' });

    account.password = newPassword; // pre-save hook will hash it
    await account.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete admin account ─────────────────────────────────────────────────────
// DELETE /api/admin/admin-accounts/:id
export const deleteAdminAccount = async (req, res) => {
  try {
    const account = await AdminAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: 'Admin account not found' });

    await account.deleteOne();
    res.json({ success: true, message: 'Admin account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Sub-admin login ──────────────────────────────────────────────────────────
// POST /api/admin/admin-accounts/login
export const adminAccountLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const account = await AdminAccount.findOne({ email: email.toLowerCase() }).select('+password');
    if (!account) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!account.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });

    const match = await account.matchPassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    account.lastLogin = new Date();
    await account.save({ validateBeforeSave: false });

    const token = generateAdminAccountToken(account);
    const safe = account.toObject();
    delete safe.password;

    res.json({
      success: true,
      data: { token, admin: safe },
      message: 'Login successful',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
