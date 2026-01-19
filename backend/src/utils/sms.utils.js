import axios from 'axios';

// @desc    Send SMS via Renflair API
export const sendSMS = async (mobile, message) => {
  try {
    // Check if SMS API is configured
    if (!process.env.SMS_API_KEY || !process.env.SMS_API_URL) {
      console.warn('⚠️ SMS API not configured. Message will be logged to console.');
      console.log(`📱 SMS to ${mobile}: ${message}`);
      return { success: true, message: 'SMS logged (API not configured)' };
    }

    // Extract OTP from message (6 digits)
    const otpMatch = message.match(/\d{6}/);
    const otp = otpMatch ? otpMatch[0] : '123456';

    // Format mobile number - Renflair expects 10 digits without country code
    let formattedMobile = mobile.replace(/\D/g, ''); // Remove non-digits
    if (formattedMobile.startsWith('91') && formattedMobile.length === 12) {
      formattedMobile = formattedMobile.substring(2); // Remove 91 prefix
    }

    console.log(`📤 Attempting to send SMS to ${formattedMobile}...`);
    console.log(`💡 OTP: ${otp}`);

    // Renflair API URL - as per their documentation
    const url = `${process.env.SMS_API_URL}/V1.php?API=${process.env.SMS_API_KEY}&PHONE=${formattedMobile}&OTP=${otp}`;
    console.log(`🔗 Request URL: ${url.replace(process.env.SMS_API_KEY, 'API_KEY_HIDDEN')}`);

    const response = await axios.get(url, {
      timeout: 15000, // 15 second timeout
    });

    console.log(`✅ SMS API Response:`, response.data);
    
    if (response.status === 200) {
      console.log(`✅ SMS sent successfully to ${mobile}`);
      return { success: true, message: 'SMS sent successfully', data: response.data };
    } else {
      console.warn('⚠️ SMS API responded but status unclear:', response.data);
      throw new Error(response.data?.message || 'SMS API returned error');
    }
  } catch (error) {
    console.error('❌ SMS sending error:', error.response?.status, error.response?.data || error.message);
    
    // Fallback: log to console in case of failure
    console.log(`📱 SMS to ${mobile} (FALLBACK): ${message}`);
    console.log(`💡 OTP Code: ${message.match(/\d{6}/)?.[0] || 'N/A'}`);
    
    // Don't throw error - allow the flow to continue
    return { 
      success: false, 
      message: 'SMS failed, OTP logged to console',
      error: error.message 
    };
  }
};

// @desc    Send OTP via SMS
export const sendOTPViaSMS = async (mobile, otp) => {
  const message = `Your Bharat Records OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Do not share this OTP with anyone.`;
  return await sendSMS(mobile, message);
};

export default {
  sendSMS,
  sendOTPViaSMS,
};
