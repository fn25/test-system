# 📧 Email Service Setup Guide

## Overview
This project uses **Nodemailer** for sending emails (password reset, welcome emails, etc.). The service supports Gmail, Outlook, and other SMTP providers.

---

## 🚀 Quick Setup (Gmail)

### 1. Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification**
3. Enable 2-Step Verification

### 2. Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Quiz System**
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 3. Configure .env
Add these to your `.env` file in the **root directory**:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Your 16-character App Password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Quiz System
FRONTEND_URL=http://localhost:3000
```

### 4. Install Dependencies
```bash
cd server
npm install nodemailer
```

### 5. Test Email Service
Start your server and test:
```bash
npm start
```

---

## 🔧 Other Email Providers

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP
```bash
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

---

## 📝 Features

### Password Reset Email
- **Trigger:** User clicks "Forgot Password" and enters email
- **Content:** Beautiful HTML email with reset link
- **Expiry:** Link expires in 1 hour
- **Security:** Token stored in database, single-use only

### Welcome Email (Optional)
- **Trigger:** User registers new account
- **Content:** Welcome message with login link
- **Note:** Won't block registration if email fails

---

## 🐛 Troubleshooting

### "Email service not configured" error
**Problem:** Environment variables not set
**Solution:**
1. Check `.env` file exists in root directory
2. Verify all EMAIL_* variables are set
3. Restart server after changing .env

### "Invalid login: 535-5.7.8 Username and Password not accepted"
**Problem:** Using regular password instead of App Password
**Solution:**
1. Enable 2FA on your Gmail account
2. Generate App Password (see step 2 above)
3. Use the 16-character App Password, not your regular password

### "Connection timeout" error
**Problem:** Firewall or network blocking SMTP
**Solution:**
1. Check if port 587 is open
2. Try port 465 with `EMAIL_PORT=465`
3. Disable firewall temporarily to test

### Email sent but not received
**Problem:** Email in spam or blocked
**Solution:**
1. Check spam/junk folder
2. Add sender email to contacts
3. Check Gmail "All Mail" folder
4. Try sending to different email provider

### "self signed certificate" error
**Problem:** SSL certificate validation
**Solution:** Already handled in code with `rejectUnauthorized: false`

---

## 🧪 Testing

### Test Forgot Password Flow:
1. Start backend: `cd server && npm start`
2. Start frontend: `cd client && npm start`
3. Go to: http://localhost:3000/forgot-password
4. Enter your email
5. Check your inbox for reset link
6. Click link (goes to /reset-password?token=...)
7. Enter new password
8. Login with new password

### Test Emails Without Frontend:
```bash
curl -X POST http://localhost:10000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use App Passwords for Gmail (not regular password)
- Set `rejectUnauthorized: true` in production
- Use environment variables for credentials
- Never commit .env file to git
- Use HTTPS in production for reset links
- Set reasonable token expiry (1 hour default)

### ❌ DON'T:
- Share your App Password
- Hardcode credentials in code
- Use regular Gmail password
- Expose email credentials in frontend
- Allow unlimited reset requests (add rate limiting)

---

## 📊 Email Templates

### Password Reset Email Features:
- ✅ Beautiful gradient header
- ✅ Clear call-to-action button
- ✅ Copy-paste link fallback
- ✅ Security warning
- ✅ Expiry notice
- ✅ Plain text alternative

### Customizing Templates:
Edit `server/services/emailService.js`:
- Change colors in CSS
- Modify email text
- Add company logo
- Change button styles

---

## 🔍 Verification

### Check Email Config:
The server automatically verifies email config on startup:
- ✅ "Email service is ready" - Configuration OK
- ❌ "Email service verification failed" - Check credentials

### Manual Verification:
```javascript
import { verifyEmailConfig } from './services/emailService.js';

const isReady = await verifyEmailConfig();
console.log('Email ready:', isReady);
```

---

## 📚 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_HOST` | Yes | SMTP server hostname | smtp.gmail.com |
| `EMAIL_PORT` | Yes | SMTP port (587 or 465) | 587 |
| `EMAIL_USER` | Yes | Email address | test@gmail.com |
| `EMAIL_PASS` | Yes | App Password (16 chars) | abcd efgh ijkl mnop |
| `EMAIL_FROM` | Optional | From address (defaults to EMAIL_USER) | no-reply@example.com |
| `EMAIL_FROM_NAME` | Optional | From name | Quiz System |
| `FRONTEND_URL` | Yes | Frontend URL for links | http://localhost:3000 |

---

## 🎨 Production Considerations

### Before Deployment:
1. Use production email address
2. Update `FRONTEND_URL` to production domain
3. Set `rejectUnauthorized: true` in emailService.js
4. Add rate limiting to prevent abuse
5. Monitor email quota (Gmail: 500/day for free accounts)
6. Consider using dedicated email service (SendGrid, AWS SES) for high volume

### Rate Limiting Example:
```javascript
// Add to forgot-password endpoint
const attempts = await redis.get(`reset:${email}`);
if (attempts > 3) {
  return res.status(429).json({
    message: 'Too many reset requests. Try again later.'
  });
}
await redis.setex(`reset:${email}`, 3600, parseInt(attempts || 0) + 1);
```

---

## 💡 Tips

1. **Test with Real Email First:** Always test with your own email before sending to users
2. **Check Spam Filters:** First emails often go to spam
3. **Monitor Logs:** Watch server console for email errors
4. **Backup Option:** Consider SMS reset as backup if email fails
5. **User Feedback:** Always show success message even if user doesn't exist (security)

---

## 🆘 Still Having Issues?

1. Check server console for detailed errors
2. Test SMTP connection manually:
   ```bash
   telnet smtp.gmail.com 587
   ```
3. Verify email credentials are correct
4. Try different email provider
5. Check if port 587/465 is blocked
6. Review Gmail security settings

---

## 📦 Dependencies

```json
{
  "nodemailer": "^6.9.7"
}
```

Install with:
```bash
cd server
npm install nodemailer
```

---

## ✅ Checklist

- [ ] 2FA enabled on Gmail
- [ ] App Password generated
- [ ] EMAIL_* variables in .env
- [ ] nodemailer installed
- [ ] Server restarted
- [ ] Test email sent successfully
- [ ] Reset link works
- [ ] Email template looks good
- [ ] Production URL updated

---

## 🎉 Success!

If you see "✅ Email service is ready" in your server logs, you're all set! 🚀
