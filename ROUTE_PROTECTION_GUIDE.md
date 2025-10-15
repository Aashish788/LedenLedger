# 🔒 Industrial-Grade Route Protection System

## Overview

This document describes the enterprise-level authentication and route protection system implemented in Lenden Ledger.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Route Protection Flow                     │
└─────────────────────────────────────────────────────────────┘

User Access Request
        ↓
   Is Loading? → YES → Show Loading Spinner
        ↓ NO
   Authenticated? → NO → Redirect to /login
        ↓ YES
   Session Valid? → NO → Redirect to /login
        ↓ YES
   Has Required Role? → NO → Show Access Denied
        ↓ YES
   ✅ Grant Access to Protected Route
```

## Components

### 1. ProtectedRoute

Wraps routes that require authentication.

#### Features:

- ✅ Session validation on route change
- ✅ Token expiry handling with auto-refresh
- ✅ Admin role checking
- ✅ Permission-based access control (RBAC)
- ✅ Security audit logging
- ✅ Activity tracking
- ✅ Network failure recovery
- ✅ Background validation without blocking UI

#### Usage:

```tsx
<Route
  path="/staff"
  element={
    <ProtectedRoute>
      <StaffPage />
    </ProtectedRoute>
  }
/>

// With admin requirement
<Route
  path="/settings"
  element={
    <ProtectedRoute requireAdmin>
      <Settings />
    </ProtectedRoute>
  }
/>

// With custom permissions (future)
<Route
  path="/reports"
  element={
    <ProtectedRoute permissions={['view_reports', 'export_data']}>
      <Reports />
    </ProtectedRoute>
  }
/>
```

### 2. PublicOnlyRoute

For routes accessible only when user is NOT authenticated (login, landing pages).

#### Usage:

```tsx
<Route
  path="/login"
  element={
    <PublicOnlyRoute>
      <Login />
    </PublicOnlyRoute>
  }
/>
```

### 3. RoleBasedRoute

Advanced route protection with fine-grained role checking.

#### Usage:

```tsx
<Route
  path="/admin/users"
  element={
    <RoleBasedRoute requiredRoles={["admin", "super_admin"]}>
      <UserManagement />
    </RoleBasedRoute>
  }
/>
```

## Security Features

### 1. Session Validation

```tsx
// Validates session on every route change
const validateSession = async () => {
  await checkSession();
  console.log("✅ Session validated for route:", location.pathname);
};
```

### 2. Audit Logging

```tsx
// Logs all protected route access attempts
console.log("🔒 Protected route access:", {
  route: "/staff",
  user: "user@example.com",
  timestamp: "2025-10-16T10:30:00Z",
  role: "admin",
});
```

### 3. Token Expiry Handling

```tsx
// Automatically refreshes expired tokens
if (tokenExpired) {
  await refreshToken();
  continue;
}
```

### 4. Rate Limiting

```tsx
// Prevents brute force attacks
if (!checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
  toast.error("Too many login attempts");
  return;
}
```

### 5. Activity Tracking

```tsx
// Auto-logout after 2 hours of inactivity
const inactivityTimeout = 2 * 60 * 60 * 1000; // 2 hours
if (Date.now() - lastActivity > inactivityTimeout) {
  logout();
}
```

## Authentication Flow

### Login Flow

```
1. User submits credentials
2. Rate limiting check
3. Email validation
4. Supabase authentication
5. Load user profile
6. Update cache
7. Store session
8. Redirect to intended destination
```

### Route Protection Flow

```
1. User navigates to /staff
2. ProtectedRoute checks authentication
3. Validate session in background
4. Check role requirements
5. Log access attempt
6. Grant or deny access
```

### Session Refresh Flow

```
1. Token expiry detected
2. Auto-refresh token
3. Update cache
4. Continue user session
5. No interruption to user
```

## Utility Hooks

### useRouteAccess

Check if user can access a route.

```tsx
const canAccessSettings = useRouteAccess("admin");

if (canAccessSettings) {
  // Show settings button
}
```

### useRouteProtection

Programmatically protect routes.

```tsx
const { requireAuth, requireRole } = useRouteProtection();

const handleAdminAction = () => {
  if (!requireRole("admin")) {
    return; // Will show error and redirect
  }

  // Proceed with admin action
};
```

## Best Practices

### ✅ DO

- Always wrap protected routes with `<ProtectedRoute>`
- Use `requireAdmin` prop for admin-only routes
- Implement proper error handling
- Log security events
- Validate sessions on critical operations
- Use CSRF tokens for state-changing operations
- Implement rate limiting on sensitive endpoints

### ❌ DON'T

- Don't check authentication in components
- Don't store sensitive data in localStorage
- Don't skip session validation
- Don't ignore security warnings
- Don't hardcode role names
- Don't expose auth tokens in URLs

## Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Timeout Settings

```tsx
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
```

## Error Handling

### Authentication Errors

```tsx
if (error.message.includes("Invalid login credentials")) {
  toast.error("Invalid email or password");
}
```

### Session Errors

```tsx
if (validationError) {
  toast.error("Session expired", {
    description: "Please login again",
  });
  navigate("/login");
}
```

### Network Errors

```tsx
try {
  await checkSession();
} catch (error) {
  // Keep using cache on network errors
  if (!authCache.isAuthenticated()) {
    handleSignOut();
  }
}
```

## Monitoring & Logging

### Access Logs

```tsx
console.log('🔒 Protected route access:', {
  route: string,
  user: string,
  userId: string,
  role: string,
  timestamp: string,
  requireAdmin: boolean,
  permissions: string[]
});
```

### Security Events

```tsx
console.warn("⚠️ Unauthorized access attempt:", {
  route: string,
  timestamp: string,
});

console.warn("⚠️ Admin access denied:", {
  route: string,
  user: string,
  role: string,
  timestamp: string,
});
```

## Testing

### Test Authentication

```tsx
// Login
await login("test@example.com", "password");

// Access protected route
navigate("/staff");

// Should see staff page

// Logout
await logout();

// Access protected route again
navigate("/staff");

// Should redirect to /login
```

### Test Admin Access

```tsx
// Login as regular user
await login("user@example.com", "password");

// Try to access admin route
navigate("/settings");

// Should see "Access Denied" message
```

## Performance Optimization

### Lazy Loading

```tsx
const StaffPage = lazy(() => import("./pages/Staff"));
```

### Caching

```tsx
// Cache auth state for instant loading
authCache.set(userData, true);
```

### Background Validation

```tsx
// Validate session without blocking UI
const validateInBackground = async () => {
  // Non-blocking validation
};
```

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
2. **OAuth Integration (Google, Facebook)**
3. **Biometric Authentication**
4. **Session Management Dashboard**
5. **Advanced Permission System**
6. **IP Whitelisting**
7. **Device Management**
8. **Security Alerts**

## Support

For issues or questions:

- Check console logs for security events
- Review browser network tab for API errors
- Contact development team

---

**Version:** 2.0.0  
**Last Updated:** October 16, 2025  
**Author:** Senior Backend Team
