import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import User from '../models/User.model.js';

const RP_NAME = process.env.RP_NAME || 'Bharat Records';
const RP_ID = process.env.RP_ID || 'localhost' || 'bharatrecords.qzz.io';
const ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

// In-memory challenge store (use Redis in production)
const challengeStore = new Map();

// ─────────────────────────────────────────────
// @desc  Generate registration options
// @route GET /api/biometric/register-options
// @access Private
// ─────────────────────────────────────────────
export const getRegistrationOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const excludeCredentials = (user.webauthnCredentials || []).map(cred => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports || []
    }));

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: user.email,
      userDisplayName: user.fullName,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred'
      }
    });

    // Store challenge keyed to user
    challengeStore.set(`reg_${user._id}`, {
      challenge: options.challenge,
      expiry: Date.now() + 5 * 60 * 1000 // 5 min
    });

    res.json({ success: true, data: options });
  } catch (error) {
    console.error('getRegistrationOptions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc  Verify registration response
// @route POST /api/biometric/register-verify
// @access Private
// ─────────────────────────────────────────────
export const verifyRegistration = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const body = req.body;

    const stored = challengeStore.get(`reg_${user._id}`);
    if (!stored || Date.now() > stored.expiry) {
      return res.status(400).json({ success: false, message: 'Challenge expired. Please try again.' });
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: stored.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: `Verification failed: ${err.message}` });
    }

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ success: false, message: 'Biometric registration verification failed.' });
    }

    const { credential } = verification.registrationInfo;

    // Save new credential (clear old ones so only latest device is stored)
    user.webauthnCredentials = [{
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      deviceType: credential.deviceType || 'singleDevice',
      backedUp: credential.backedUp || false,
      transports: body.response?.transports || []
    }];

    user.security.biometricEnabled = true;
    await user.save();

    challengeStore.delete(`reg_${user._id}`);

    res.json({ success: true, message: 'Biometric registered successfully.' });
  } catch (error) {
    console.error('verifyRegistration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc  Generate authentication options
// @route POST /api/biometric/auth-options
// @access Public (needs userId in body)
// ─────────────────────────────────────────────
export const getAuthOptions = async (req, res) => {
  try {
    const { userId } = req.body;

    // Support authenticated requests too
    const resolvedUserId = userId || req.user?._id;
    if (!resolvedUserId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const user = await User.findById(resolvedUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.security?.biometricEnabled || !user.webauthnCredentials?.length) {
      return res.status(400).json({ success: false, message: 'Biometric not enabled for this account.' });
    }

    const allowCredentials = user.webauthnCredentials.map(cred => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports || []
    }));

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials
    });

    challengeStore.set(`auth_${resolvedUserId}`, {
      challenge: options.challenge,
      expiry: Date.now() + 5 * 60 * 1000
    });

    res.json({ success: true, data: { ...options, userId: resolvedUserId } });
  } catch (error) {
    console.error('getAuthOptions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc  Verify authentication response
// @route POST /api/biometric/auth-verify
// @access Public
// ─────────────────────────────────────────────
export const verifyAuthentication = async (req, res) => {
  try {
    const { userId, ...authResponse } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const stored = challengeStore.get(`auth_${userId}`);
    if (!stored || Date.now() > stored.expiry) {
      return res.status(400).json({ success: false, message: 'Challenge expired. Please try again.' });
    }

    // Find the matching credential
    const dbCred = user.webauthnCredentials?.find(c => c.id === authResponse.id);
    if (!dbCred) {
      return res.status(400).json({ success: false, message: 'Credential not found for this device.' });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: authResponse,
        expectedChallenge: stored.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true,
        credential: {
          id: dbCred.id,
          publicKey: new Uint8Array(dbCred.publicKey.buffer
            ? dbCred.publicKey.buffer
            : dbCred.publicKey),
          counter: dbCred.counter,
          transports: dbCred.transports || []
        }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: `Verification failed: ${err.message}` });
    }

    if (!verification.verified) {
      return res.status(400).json({ success: false, message: 'Biometric authentication failed.' });
    }

    // Update counter
    dbCred.counter = verification.authenticationInfo.newCounter;
    await user.save();

    challengeStore.delete(`auth_${userId}`);

    res.json({ success: true, message: 'Biometric authentication successful.' });
  } catch (error) {
    console.error('verifyAuthentication error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc  Disable biometric
// @route DELETE /api/biometric/disable
// @access Private
// ─────────────────────────────────────────────
export const disableBiometric = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.security.biometricEnabled = false;
    user.webauthnCredentials = [];
    await user.save();
    res.json({ success: true, message: 'Biometric disabled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc  Get biometric status
// @route GET /api/biometric/status
// @access Private
// ─────────────────────────────────────────────
export const getBiometricStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        enabled: user.security?.biometricEnabled || false,
        credentialCount: user.webauthnCredentials?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
