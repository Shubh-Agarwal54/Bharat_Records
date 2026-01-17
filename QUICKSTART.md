# ⚡ Quick Start - Test Nominee System Right Now!

## 🎯 Ready to Test? Follow These 5 Simple Steps

### Step 1: Open Frontend (1 minute)
```bash
cd frontend
npm run dev
```
Open: http://localhost:5173

### Step 2: Login as Owner (30 seconds)
- Login with any existing account
- This will be the document owner

### Step 3: Add & Invite Nominee (2 minutes)
1. Click **Menu** → **My Nominees**
2. Click **+ Add Nominee**
3. Fill form:
   - Name: `Test Child`
   - Email: `child@test.com`
   - Mobile: `9876543210`
   - Relationship: `Child`
   - Click **Save**

4. Click **🔑 Grant Access** button
5. Set permissions:
   - Access Level: **Download**
   - Categories: Check **Personal Documents** + **Investment Documents**
   - Click **Send Invitation**

6. **Copy the invite link from success message!**
   (Looks like: `http://localhost:5173/nominee-invite/abc123...`)

### Step 4: Accept as Nominee (1 minute)
1. **Logout** from owner account
2. **Login** as different user (nominee's account)
3. **Paste the invite link** in browser
4. Click **✅ Accept Invitation**
5. Auto-redirected to **Nominee Access** page

### Step 5: View Owner's Documents (30 seconds)
1. See owner's account card
2. Click **Access Account**
3. ✅ You'll see ONLY Personal + Investment documents
4. Click **👁️ View** or **📥 Download** buttons
5. **Success!** Nominee can access owner's documents! 🎉

---

## 📧 Want to Test Real Emails?

### Gmail Setup (5 minutes)
1. Go to: https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy the 16-character password
4. Edit `backend/.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
5. Restart backend: `Ctrl+C` → `npm run dev`
6. Grant access again → Nominee receives beautiful email! 📧

---

## 🔍 What You'll See

### Backend Console (No Email)
```
========================================
📧 NOMINEE INVITATION EMAIL (Development Mode)
========================================
To: child@test.com
Invite Link: http://localhost:5173/nominee-invite/abc123...
========================================
```

### Frontend Success Message
```
✅ Invitation sent! Share this link: http://localhost:5173/nominee-invite/abc123...
```

### Nominee Access Page
```
┌─────────────────────────────────────┐
│  👤 Owner Name                      │
│  📧 owner@email.com                 │
│  🔑 Download Access                 │
│  ⏰ Last accessed: Never            │
│  [Access Account]                   │
└─────────────────────────────────────┘
```

### Document List (Filtered)
```
✅ Personal Documents (2)
✅ Investment Documents (5)
❌ Insurance (not accessible)
❌ Loans (not accessible)
```

---

## ✨ Features Demonstrated

✅ **Email System**: Automatic or manual link sharing
✅ **Access Control**: Only permitted categories visible
✅ **Permission Levels**: View vs Download enforcement
✅ **Security**: Backend validates every request
✅ **UX**: Smooth flow from invite to access
✅ **Audit Trail**: Access logging in background

---

## 🎊 That's It!

Your nominee system is **fully functional**!

- ✅ Invitations work (email or manual link)
- ✅ Nominees can access owner's documents
- ✅ Permissions enforced on backend
- ✅ Owner can revoke anytime
- ✅ Production-ready!

**Start testing now!** 🚀
