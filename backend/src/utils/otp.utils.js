import pkg from 'nodemailer';
const { createTransport } = pkg;
import { sendOTPViaSMS } from './sms.utils.js';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Create email transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  // Check if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('✉️ Email transporter initialized');
  } else {
    console.log('⚠️ SMTP not configured, OTPs will be logged to console');
  }

  return transporter;
};

// @desc    Send OTP via email and/or SMS
export const sendOTP = async (emailOrMobile, purpose = 'verification', userDetails = null) => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (10 minutes)
    const expiryTime = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000;
    otpStore.set(emailOrMobile, { otp, expiryTime, purpose });
    
    // Check if it's an email or mobile
    const isEmail = emailOrMobile.includes('@');
    
    if (isEmail) {
      // Send OTP via email
      const emailTransporter = createTransporter();
      
      if (emailTransporter) {
        try {
          const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Bharat Records'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: emailOrMobile,
            subject: 'Your Bharat Records OTP',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Bharat Records</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #333; margin-top: 0;">Your OTP Code</h2>
                  <p style="color: #666; font-size: 16px;">Use this OTP to ${purpose === 'signup' ? 'complete your signup' : 'verify your account'}:</p>
                  <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                  </div>
                  <p style="color: #999; font-size: 14px;">This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
                  <p style="color: #999; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px; text-align: center;">© 2025 Bharat Records. All rights reserved.</p>
                </div>
              </div>
            `,
            text: `Your Bharat Records OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`
          };

          await emailTransporter.sendMail(mailOptions);
          console.log(`✉️ OTP sent to email: ${emailOrMobile}`);
        } catch (emailError) {
          console.error('Error sending email:', emailError.message);
          console.log(`📱 OTP for ${emailOrMobile}: ${otp} (Email failed, check console)`);
        }
      } else {
        // SMTP not configured, log to console
        console.log(`📱 OTP for ${emailOrMobile}: ${otp}`);
        console.log(`⏰ Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes`);
      }
      
      // If user has mobile number, send OTP to mobile as well
      if (userDetails && userDetails.mobile) {
        await sendOTPViaSMS(userDetails.mobile, otp);
      }
    } else {
      // Mobile number - send via SMS
      await sendOTPViaSMS(emailOrMobile, otp);
      console.log(`📱 OTP sent to mobile: ${emailOrMobile}`);
      
      // If user has email, send OTP to email as well
      if (userDetails && userDetails.email) {
        const emailTransporter = createTransporter();
        if (emailTransporter) {
          try {
            const mailOptions = {
              from: `"${process.env.FROM_NAME || 'Bharat Records'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
              to: userDetails.email,
              subject: 'Your Bharat Records OTP',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Bharat Records</h1>
                  </div>
                  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Your OTP Code</h2>
                    <p style="color: #666; font-size: 16px;">Use this OTP to ${purpose === 'signup' ? 'complete your signup' : 'verify your account'}:</p>
                    <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                      <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #999; font-size: 14px;">This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
                    <p style="color: #999; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">© 2025 Bharat Records. All rights reserved.</p>
                  </div>
                </div>
              `,
              text: `Your Bharat Records OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`
            };

            await emailTransporter.sendMail(mailOptions);
            console.log(`✉️ OTP also sent to email: ${userDetails.email}`);
          } catch (emailError) {
            console.error('Error sending email:', emailError.message);
          }
        }
      }
    }
    
    // Return OTP for development/testing
    return { success: true, otp: process.env.NODE_ENV === 'production' ? null : otp };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// @desc    Verify OTP
export const verifyOTP = async (emailOrMobile, otp) => {
  try {
    const storedData = otpStore.get(emailOrMobile);
    
    if (!storedData) {
      return false;
    }
    
    // Check expiry
    if (Date.now() > storedData.expiryTime) {
      otpStore.delete(emailOrMobile);
      return false;
    }
    
    // Verify OTP
    if (storedData.otp === otp) {
      otpStore.delete(emailOrMobile);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

// @desc    Resend OTP
export const resendOTP = async (emailOrMobile, purpose) => {
  return await sendOTP(emailOrMobile, purpose);
};
