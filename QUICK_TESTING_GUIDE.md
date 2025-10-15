# 🧪 QUICK TESTING GUIDE - Multi-User Verification

**Purpose:** Verify your system works correctly for multiple users  
**Time Required:** 15-20 minutes  
**Prerequisites:** 2 test accounts (different emails)

---

## 🎯 TEST 1: USER ISOLATION (CRITICAL!)

**Goal:** Verify User A cannot see User B's data

### Setup:

1. Create 2 test accounts:
   - Account A: `testa@example.com` / `password123`
   - Account B: `testb@example.com` / `password123`

### Steps:

#### Step 1: Add Data as User A

```
1. Open browser tab/window 1
2. Go to: http://localhost:5173 (or your dev server)
3. Login as testa@example.com
4. Add customer: "Customer A - Test User A"
5. Add supplier: "Supplier A - Test User A"
6. Note: Customer should appear in list immediately
```

#### Step 2: Check User B Doesn't See It

```
1. Open browser tab/window 2 (or incognito)
2. Go to: http://localhost:5173
3. Login as testb@example.com
4. Check customers list
   ✅ EXPECTED: Should be EMPTY (or only testb's data)
   ❌ FAIL IF: You see "Customer A - Test User A"
```

#### Step 3: Add Data as User B

```
1. Still logged in as testb@example.com
2. Add customer: "Customer B - Test User B"
3. Add supplier: "Supplier B - Test User B"
4. Note: Customer should appear in User B's list
```

#### Step 4: Verify User A Still Doesn't See User B's Data

```
1. Go back to tab/window 1 (User A)
2. Refresh page (or check list)
   ✅ EXPECTED: Only shows "Customer A - Test User A"
   ❌ FAIL IF: You see "Customer B - Test User B"
```

### ✅ PASS CRITERIA:

- User A sees only their own data
- User B sees only their own data
- No data leakage between users

### 🐛 If Test Fails:

Check `WEB_PROJECT_ANALYSIS_REPORT.md` Section "Security Analysis"

---

## 🎯 TEST 2: WEB → MOBILE SYNC (Same User)

**Goal:** Verify data added on web appears on mobile

### Setup:

1. Same account on web and mobile: `testa@example.com`
2. Mobile app already has real-time sync working

### Steps:

#### Step 1: Open Mobile App

```
1. Open mobile app
2. Login as testa@example.com
3. Go to customers list
4. Note current number of customers
5. Keep app open (don't close)
```

#### Step 2: Add Customer on Web

```
1. On web browser (same account)
2. Add new customer: "Web Customer - [Timestamp]"
3. Note the exact time you added it
```

#### Step 3: Check Mobile App

```
1. Go back to mobile app
2. Don't refresh manually
3. Wait 2-5 seconds
   ✅ EXPECTED: New customer appears automatically
   ❌ FAIL IF: Customer doesn't appear after 10 seconds
```

### ✅ PASS CRITERIA:

- Customer appears on mobile within 5 seconds
- No manual refresh needed
- Real-time sync working

### 🐛 If Test Fails:

1. Check mobile app console logs
2. Look for: "🔄 Real-time change received"
3. Verify user_id matches in logs
4. Check internet connection on mobile

---

## 🎯 TEST 3: MOBILE → WEB SYNC (Same User)

**Goal:** Verify data added on mobile appears on web

### Setup:

1. Same account on web and mobile: `testa@example.com`
2. Keep web browser open

### Steps:

#### Step 1: Open Web Browser

```
1. Login as testa@example.com
2. Go to customers page
3. Note current number of customers
4. Keep browser open
```

#### Step 2: Add Customer on Mobile

```
1. Open mobile app
2. Add new customer: "Mobile Customer - [Timestamp]"
3. Note the exact time you added it
```

#### Step 3: Check Web Browser

```
1. Go back to web browser
2. Don't refresh manually
3. Wait 2-5 seconds
   ✅ EXPECTED: New customer appears automatically
   ❌ FAIL IF: Customer doesn't appear after 10 seconds
```

### ✅ PASS CRITERIA:

- Customer appears on web within 5 seconds
- No manual refresh needed
- Real-time sync working bidirectionally

### 🐛 If Test Fails:

1. Open browser console (F12)
2. Look for real-time subscription errors
3. Check network tab for WebSocket connection
4. Verify `realtimeSyncService` is initialized

---

## 🎯 TEST 4: MULTI-DEVICE SAME USER

**Goal:** Verify same user can sync across multiple devices

### Setup:

1. Same account on 3 devices:
   - Device 1: Web browser (Chrome)
   - Device 2: Web browser (Firefox/Edge)
   - Device 3: Mobile app

### Steps:

#### Step 1: Login on All Devices

```
1. Device 1: Login as testa@example.com
2. Device 2: Login as testa@example.com
3. Device 3: Login as testa@example.com
4. All should show same data
```

#### Step 2: Add Customer on Device 1

```
1. Device 1: Add customer "Multi-Device Test"
2. Wait 2 seconds
```

#### Step 3: Verify on Other Devices

```
1. Device 2: Should show new customer (no refresh)
2. Device 3: Should show new customer (no refresh)
   ✅ EXPECTED: Both devices show new customer
```

#### Step 4: Update Customer on Device 2

```
1. Device 2: Edit "Multi-Device Test"
2. Change phone number to "9999999999"
3. Wait 2 seconds
```

#### Step 5: Verify Update Everywhere

```
1. Device 1: Should show updated phone (no refresh)
2. Device 3: Should show updated phone (no refresh)
   ✅ EXPECTED: All devices show updated data
```

### ✅ PASS CRITERIA:

- Same user sees same data on all devices
- Changes sync in real-time across all devices
- No conflicts or data loss

---

## 🎯 TEST 5: OFFLINE → ONLINE SYNC

**Goal:** Verify offline operations sync when back online

### Steps:

#### Step 1: Go Offline

```
1. Open web browser
2. Login as testa@example.com
3. Open browser DevTools (F12)
4. Go to Network tab
5. Click "Offline" (throttling dropdown)
```

#### Step 2: Add Customer While Offline

```
1. Try to add customer "Offline Customer"
2. Should see:
   - Customer appears in UI (optimistic update)
   - May show "pending sync" indicator
```

#### Step 3: Go Back Online

```
1. DevTools Network tab → Change to "Online"
2. Wait 5 seconds
3. Refresh page
   ✅ EXPECTED: "Offline Customer" still there
   ❌ FAIL IF: Customer disappeared
```

#### Step 4: Verify on Another Device

```
1. Open mobile app (same account)
2. Check customers list
   ✅ EXPECTED: "Offline Customer" appears
```

### ✅ PASS CRITERIA:

- Operations queued when offline
- Operations synced when back online
- No data loss

---

## 📊 TEST RESULTS TEMPLATE

```
Test Date: __________
Tester: __________

✅ Test 1: User Isolation
   - User A isolated: [ ] Pass [ ] Fail
   - User B isolated: [ ] Pass [ ] Fail
   - Notes: _______________________

✅ Test 2: Web → Mobile Sync
   - Data appears on mobile: [ ] Pass [ ] Fail
   - Latency: ______ seconds
   - Notes: _______________________

✅ Test 3: Mobile → Web Sync
   - Data appears on web: [ ] Pass [ ] Fail
   - Latency: ______ seconds
   - Notes: _______________________

✅ Test 4: Multi-Device Same User
   - All devices sync: [ ] Pass [ ] Fail
   - Notes: _______________________

✅ Test 5: Offline → Online Sync
   - Offline operations saved: [ ] Pass [ ] Fail
   - Sync after online: [ ] Pass [ ] Fail
   - Notes: _______________________

OVERALL RESULT: [ ] All Tests Passed [ ] Issues Found
```

---

## 🐛 DEBUGGING TIPS

### If User Isolation Fails:

```javascript
// Check console logs:
// Should see:
console.log("User ID:", user.id);
console.log("Creating customer with user_id:", user.id);

// Should NOT see:
console.log("User ID: undefined");
console.log("User ID: null");
```

### If Real-time Sync Fails:

```javascript
// Check browser console for:
✅ "🚀 Initializing Real-Time Sync Service..."
✅ "✅ Subscribed to customers changes"
✅ "🔄 Real-time change received"

// If missing, check:
1. realtimeSyncService is initialized
2. WebSocket connection is active (Network tab)
3. Supabase real-time is enabled
```

### If Offline Sync Fails:

```javascript
// Check browser console for:
✅ "📦 Queued offline operation"
✅ "🌐 Network restored, processing offline queue..."
✅ "✅ Offline operation synced successfully"

// Check localStorage:
localStorage.getItem('realtime_offline_queue')
// Should show queued operations
```

---

## 🎯 QUICK VERIFICATION SCRIPT

Run this in browser console to verify setup:

```javascript
// 1. Check authentication
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("✅ Authenticated user:", user?.id);

// 2. Check customers are filtered by user_id
const { data: customers } = await supabase
  .from("customers")
  .select("id, user_id, name")
  .limit(5);
console.log("✅ Customers:", customers);
// All should have same user_id as authenticated user

// 3. Check real-time subscription
const channels = supabase.getChannels();
console.log("✅ Active channels:", channels.length);
// Should be > 0 if subscribed

// 4. Check offline queue
const queue = localStorage.getItem("realtime_offline_queue");
console.log("✅ Offline queue:", queue ? JSON.parse(queue).length : 0);
```

---

## ✅ TESTING CHECKLIST

Before production:

- [ ] Test 1: User Isolation (CRITICAL!)
- [ ] Test 2: Web → Mobile Sync
- [ ] Test 3: Mobile → Web Sync
- [ ] Test 4: Multi-Device Same User
- [ ] Test 5: Offline → Online Sync
- [ ] All tests passed with no issues
- [ ] Tested with 2+ simultaneous users
- [ ] Verified data integrity after tests
- [ ] No errors in browser console
- [ ] No errors in mobile app logs

**Once all tests pass: ✅ READY FOR PRODUCTION!**

---

**Pro Tip:** Record a video of Test 1 (User Isolation) to prove the system works correctly. This is your most critical test!

---

**End of Quick Testing Guide**
