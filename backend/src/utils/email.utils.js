import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Emails will be logged to console only.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send nominee invitation email
export const sendNomineeInvitation = async (nomineeEmail, nomineeName, ownerName, inviteLink, accessLevel, categories) => {
  const transporter = createTransporter();

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3D1F8F 0%, #2D165F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #3D1F8F; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Account Access Invitation</h1>
        </div>
        <div class="content">
          <p>Hello ${nomineeName},</p>
          
          <p><strong>${ownerName}</strong> has granted you access to their Bharat Records account and documents.</p>
          
          <div class="info-box">
            <p><strong>Access Details:</strong></p>
            <ul>
              <li><strong>Access Level:</strong> ${accessLevel.toUpperCase()}</li>
              <li><strong>Document Categories:</strong> ${categories.join(', ')}</li>
            </ul>
          </div>

          <p>Click the button below to accept this invitation and start accessing their documents:</p>
          
          <center>
            <a href="${inviteLink}" class="button">✅ Accept Invitation</a>
          </center>

          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>You must be logged in to accept this invitation</li>
            <li>You will only see documents the owner has permitted</li>
            <li>Access may be time-limited based on owner's settings</li>
          </ul>

          <p>If you didn't expect this invitation, you can safely ignore this email.</p>

          <div class="footer">
            <p>This is an automated email from Bharat Records</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Hello ${nomineeName},

${ownerName} has granted you access to their Bharat Records account.

Access Details:
- Access Level: ${accessLevel.toUpperCase()}
- Document Categories: ${categories.join(', ')}

Accept Invitation:
${inviteLink}

Important Notes:
- You must be logged in to accept this invitation
- You will only see documents the owner has permitted
- Access may be time-limited based on owner's settings

If you didn't expect this invitation, you can safely ignore this email.

---
Bharat Records - Secure Document Management
  `;

  if (!transporter) {
    // No email configured - log to console for development
    console.log('\n========================================');
    console.log('📧 NOMINEE INVITATION EMAIL (Development Mode)');
    console.log('========================================');
    console.log(`To: ${nomineeEmail}`);
    console.log(`Subject: You've been granted access to ${ownerName}'s account`);
    console.log(`Invite Link: ${inviteLink}`);
    console.log('========================================\n');
    return {
      success: true,
      message: 'Email logged to console (development mode)',
      inviteLink // Return for frontend display in dev mode
    };
  }

  try {
    await transporter.sendMail({
      from: `"Bharat Records" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: nomineeEmail,
      subject: `🔑 You've been granted access to ${ownerName}'s account`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`✅ Invitation email sent to ${nomineeEmail}`);
    return {
      success: true,
      message: 'Invitation email sent successfully'
    };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Failed to send invitation email');
  }
};

export default {
  sendNomineeInvitation
};
