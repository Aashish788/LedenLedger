# 🎯 Forgot Password - Quick Start Guide

## 🚀 How to Use (User Perspective)

### Step 1: Access Forgot Password

```
Login Page → Click "Forgot password?" link
```

**Route**: `/login` → `/forgot-password`

---

### Step 2: Enter Email

```
┌─────────────────────────────────┐
│  Forgot password?                │
│                                   │
│  Email:                          │
│  ┌─────────────────────────┐    │
│  │ name@example.com        │    │
│  └─────────────────────────┘    │
│                                   │
│  [  Send reset link  ]           │
│                                   │
│  Remember? Sign in               │
└─────────────────────────────────┘
```

**What happens**:

- Email validation (format check)
- Rate limiting (3 attempts/5 min)
- Supabase sends reset email
- Success message displayed

---

### Step 3: Check Email

```
┌─────────────────────────────────┐
│  ✓ Check your email              │
│                                   │
│  📧 Sent to: user@example.com    │
│                                   │
│  We've sent you password reset   │
│  instructions.                    │
│                                   │
│  [    Resend email    ]          │
│  [ Return to login ]             │
│                                   │
│  Didn't receive?                 │
│  • Check spam folder             │
│  • Wait a few minutes            │
└─────────────────────────────────┘
```

---

### Step 4: Click Email Link

**Email contains**:

```
Subject: Reset Your Password - Lenden Ledger

Hi there,

Someone requested a password reset for your account.

Click here to reset your password:
→ https://your-domain.com/reset-password#access_token=...

This link expires in 1 hour.

If you didn't request this, ignore this email.
```

---

### Step 5: Reset Password

```
┌─────────────────────────────────┐
│  Set new password                │
│                                   │
│  New Password:                   │
│  ┌─────────────────────────┐ 👁 │
│  │ ••••••••••••            │    │
│  └─────────────────────────┘    │
│                                   │
│  Strength: ████████░░ Strong     │
│                                   │
│  Confirm Password:               │
│  ┌─────────────────────────┐ 👁 │
│  │ ••••••••••••            │    │
│  └─────────────────────────┘    │
│                                   │
│  ✓ At least 8 characters         │
│  ✓ Uppercase + lowercase         │
│  ✓ Contains number               │
│  ✓ Special character             │
│                                   │
│  [  Update password  ]           │
└─────────────────────────────────┘
```

**Password Strength Colors**:

- 🔴 Weak (20%)
- 🟠 Fair (40%)
- 🟡 Good (60%)
- 🔵 Strong (80%)
- 🟢 Very Strong (100%)

---

### Step 6: Success!

```
┌─────────────────────────────────┐
│  ✅ Password updated!            │
│                                   │
│  Your password has been          │
│  successfully updated.           │
│                                   │
│  [  Continue to Login  ]         │
│                                   │
│  Redirecting in 3 seconds...     │
└─────────────────────────────────┘
```

Auto-redirects to `/login` after 3 seconds

---

## 🔧 Developer Quick Reference

### Routes Added

```typescript
/forgot-password  → ForgotPassword.tsx (Public)
/reset-password   → ResetPassword.tsx  (Public, token required)
```

### Key Functions

```typescript
// Forgot Password
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/reset-password`,
});

// Reset Password
supabase.auth.updateUser({
  password: newPassword,
});
```

### Rate Limiting

```typescript
checkRateLimit("password-reset", 3, 300000);
// Key: 'password-reset'
// Max: 3 attempts
// Window: 300000ms (5 minutes)
```

---

## 🎨 Component Structure

```
ForgotPassword.tsx
├── Email Form
│   ├── Email Input (validated)
│   ├── Submit Button (with loading)
│   └── Back to Login Link
│
└── Success State
    ├── Success Icon
    ├── Email Sent Message
    ├── Resend Button
    └── Troubleshooting Tips

ResetPassword.tsx
├── Token Validation (auto)
├── Password Form
│   ├── New Password Input
│   │   ├── Show/Hide Toggle
│   │   └── Strength Indicator
│   ├── Confirm Password Input
│   │   └── Show/Hide Toggle
│   ├── Requirements Checklist
│   └── Submit Button
│
└── Success State
    ├── Success Icon
    ├── Success Message
    └── Continue Button (auto-redirect)
```

---

## 🧪 Testing Checklist

### Manual Tests

- [ ] Click "Forgot password?" on login page
- [ ] Enter invalid email format (should show error)
- [ ] Enter valid email (should show success)
- [ ] Check email inbox (and spam)
- [ ] Click reset link in email
- [ ] Try weak password (should show red indicator)
- [ ] Try mismatched passwords (should show error)
- [ ] Enter strong password (should show green indicator)
- [ ] Submit form (should succeed)
- [ ] Verify auto-redirect to login
- [ ] Login with new password

### Edge Cases

- [ ] Try 4+ reset attempts (rate limiting)
- [ ] Click old/expired link (should fail gracefully)
- [ ] Navigate to `/reset-password` without token
- [ ] Try resending email multiple times
- [ ] Test on mobile device
- [ ] Test with screen reader

---

## 🔥 Common Issues & Solutions

### Issue: Email not received

**Solution**:

1. Check spam folder
2. Verify Supabase email settings
3. Check Supabase logs
4. Try different email provider

### Issue: Reset link doesn't work

**Solution**:

1. Check if link expired (1 hour limit)
2. Request new reset email
3. Check for URL encoding issues

### Issue: "Invalid or expired link" error

**Solution**:

1. Link may be >1 hour old
2. Link may have been used already
3. Request new reset email from `/forgot-password`

### Issue: Password update fails

**Solution**:

1. Check password meets all requirements:
   - ≥8 characters
   - Uppercase + lowercase
   - At least one number
2. Make sure passwords match
3. Cannot reuse old password

---

## 📱 Mobile Experience

### Mobile View

- Full-width layout
- No sidebar (info hidden on mobile)
- Touch-friendly input sizes
- Proper keyboard types (email/password)
- Auto-zoom disabled on inputs

### Tablet View

- Optimized spacing
- Conditional sidebar visibility
- Responsive typography

---

## 🎯 Key Features at a Glance

| Feature              | Status | Description                 |
| -------------------- | ------ | --------------------------- |
| Email Validation     | ✅     | Format check + sanitization |
| Rate Limiting        | ✅     | 3 attempts per 5 minutes    |
| Token Validation     | ✅     | Auto-check on reset page    |
| Password Strength    | ✅     | Real-time indicator         |
| Show/Hide Password   | ✅     | Toggle visibility           |
| Responsive Design    | ✅     | Mobile + desktop            |
| Loading States       | ✅     | All async operations        |
| Error Handling       | ✅     | User-friendly messages      |
| Auto-redirect        | ✅     | After successful reset      |
| No Email Enumeration | ✅     | Security best practice      |

---

## 🚦 Status Indicators

### ForgotPassword Page

```
🔄 Loading    → Sending email...
✅ Success    → Email sent! Check your inbox
❌ Error      → Invalid email format
⏱️ Rate Limit → Too many attempts, wait 5 min
```

### ResetPassword Page

```
🔄 Verifying  → Checking reset link...
🔴 Weak       → Password too weak
🟡 Good       → Password meets requirements
🟢 Strong     → Excellent password!
✅ Success    → Password updated!
❌ Error      → Link expired or invalid
```

---

## 💡 Pro Tips

1. **Testing Locally**

   - Use a real email address
   - Check spam folder
   - Supabase provides test SMTP

2. **Production Setup**

   - Configure custom SMTP (SendGrid, etc.)
   - Customize email templates in Supabase
   - Set up proper DNS records (SPF, DKIM)

3. **User Education**

   - Inform users to check spam
   - Show clear instructions
   - Provide troubleshooting tips

4. **Security**
   - Never reveal if email exists
   - Enforce strong passwords
   - Monitor rate limit hits

---

## 📞 Support

If you encounter issues:

1. Check the main documentation: `FORGOT_PASSWORD_IMPLEMENTATION.md`
2. Review Supabase Auth logs
3. Check browser console for errors
4. Verify environment configuration

---

**Status**: ✅ Ready to use!
**Last Updated**: Implementation complete
**Version**: 1.0.0
