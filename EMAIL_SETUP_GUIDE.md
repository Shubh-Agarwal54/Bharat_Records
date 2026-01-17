# 📧 Email Configuration Guide for Nominee Invitations

## Overview
The nominee invitation system can send emails automatically. If email credentials are not configured, invitation links will be logged to the console for manual sharing.

## Email Service Options

### Option 1: Gmail (Recommended for Development)
1. **Enable 2-Step Verification** on your Gmail account
2. **Create an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `.env` file**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=Bharat Records <your-gmail@gmail.com>
```

### Option 2: SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env`:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=Bharat Records <noreply@yourdomain.com>
```

### Option 3: AWS SES (For AWS Deployments)
1. Set up AWS SES in your AWS console
2. Verify your domain/email
3. Get SMTP credentials
4. Update `.env`:
```env
EMAIL_HOST=email-smtp.ap-south-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-aws-smtp-username
EMAIL_PASS=your-aws-smtp-password
EMAIL_FROM=Bharat Records <noreply@yourdomain.com>
```

## Current Behavior

### With Email Configured ✅
- Nominee receives professional HTML email with:
  - Owner's name and invitation details
  - Access level and permitted categories
  - Clickable "Accept Invitation" button
  - Important notes about usage
- Email sent automatically when owner clicks "Send Invite"

### Without Email Configured ⚠️
- System logs invitation link to backend console
- Frontend displays the invite link in success message
- Owner must manually copy and share the link with nominee
- Perfect for development/testing

## How Nominees Receive Access

1. **Owner grants access** in "My Nominees" page
2. **Email sent** (or link logged) with unique token
3. **Nominee clicks link** → redirected to `/nominee-invite/{token}`
4. **Nominee must be logged in** to accept invitation
5. **After acceptance** → nominee can access owner's documents via "Nominee Access" page

## What Nominees Can Access

Access is controlled by two settings:

### Access Level
- **View**: Can only view documents
- **Download**: Can view and download documents
- **Full**: View, download, and share documents

### Document Categories
Owner selects which categories nominee can access:
- Personal Documents
- Investment Documents
- Insurance Documents
- Loans & Liabilities
- Retirement Documents

### Access Duration (Optional)
- Owner can set expiration: 7, 30, 90, 180 days, or 1 year
- Access automatically revoked after expiration
- Owner can manually revoke anytime

## Testing the System

### Development Mode (No Email)
1. Add a nominee in "My Nominees"
2. Click "🔑 Grant Access"
3. Configure permissions and click "Send Invite"
4. Check backend console for invite link
5. Copy link and open in browser (while logged in as nominee)
6. Accept invitation
7. Navigate to "Nominee Access" page
8. Select the account to view documents

### Production Mode (With Email)
1. Configure email credentials in `.env`
2. Restart backend server: `npm run dev`
3. Add nominee and grant access
4. Nominee receives email automatically
5. Nominee clicks link in email
6. Continues from step 6 above

## Troubleshooting

### Emails Not Sending
- Check console for error messages
- Verify email credentials are correct
- Check if Gmail has blocked "less secure app" access
- Use App Password instead of regular password for Gmail
- Check SendGrid/SES quotas and limits

### Invitation Link Not Working
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check if nominee is logged in
- Verify token hasn't expired (tokens are single-use)
- Check browser console for errors

### Nominee Can't See Documents
- Verify invitation was accepted (check "My Nominees" → status should be "Accepted")
- Check access hasn't expired
- Verify nominee is accessing via "Nominee Access" page (not "My Documents")
- Check owner granted appropriate categories

## Security Features

✅ **Secure token generation** using crypto module
✅ **Single-use tokens** - invalid after acceptance
✅ **Granular permissions** - control what nominee can do
✅ **Category filtering** - limit document types
✅ **Time-limited access** - optional expiration
✅ **Audit logging** - tracks when nominee accesses account
✅ **Revocable access** - owner can remove access anytime
✅ **Login required** - must be authenticated user

## Email Template Preview

The invitation email includes:
- Purple gradient header with "Account Access Invitation"
- Personal greeting with owner's name
- Access details (level + categories)
- Large "Accept Invitation" button
- Important notes section
- Professional footer

## Support

For issues or questions, check:
1. Backend console logs
2. Frontend browser console
3. Network tab for API errors
4. `.env` file configuration
