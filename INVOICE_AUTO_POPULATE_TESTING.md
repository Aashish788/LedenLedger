# 🧪 Quick Testing Guide - Invoice Auto-Populate Feature

## 🎯 Purpose

Verify that business details automatically populate from Settings into invoice creation.

---

## ✅ Test Steps

### **Test 1: Basic Auto-Population**

1. Navigate to **Settings** page
2. Fill in Business Information:
   - Business Name: "Test Company Ltd"
   - Phone: "+91 9876543210"
   - Email: "test@company.com"
   - GST Number: "27AABCT1234C1Z5"
   - Address: "123 Test Street"
   - City: "Mumbai"
   - State: "Maharashtra"
   - Pincode: "400001"
3. Click **Save**
4. Navigate to **Invoices** page
5. Click **"Create Invoice"** button
6. ✅ **Verify**: All business fields are pre-filled with Settings data
7. ✅ **Verify**: Green badge shows "Auto-filled from Settings"
8. ✅ **Verify**: Toast notification appears

**Expected Result:**

- Business section shows all data from Settings
- Badge is visible
- Toast says "Business details loaded from Settings"

---

### **Test 2: Address Concatenation**

1. In Settings, enter:
   - Address: "456 Main Road"
   - City: "Bangalore"
   - State: "Karnataka"
   - Pincode: "560001"
2. Save Settings
3. Open Invoice modal
4. ✅ **Verify**: Business Address shows: "456 Main Road, Bangalore, Karnataka, 560001"

**Expected Result:**

- Address is properly formatted with commas
- All components included in correct order

---

### **Test 3: Currency Sync**

1. In Settings, change Currency to "USD"
2. Save Settings
3. Open Invoice modal
4. ✅ **Verify**: Currency dropdown shows "USD"
5. ✅ **Verify**: Currency symbol is "$" in calculations

**Expected Result:**

- Currency matches Settings
- All amounts display correct symbol

---

### **Test 4: Partial Data Handling**

1. In Settings, fill only:
   - Business Name: "Partial Co"
   - Phone: "9876543210"
   - (Leave other fields empty)
2. Save Settings
3. Open Invoice modal
4. ✅ **Verify**: Only Business Name and Phone are filled
5. ✅ **Verify**: Other fields remain empty/editable

**Expected Result:**

- No errors
- Graceful handling of missing data
- Fields remain usable

---

### **Test 5: User Override Capability**

1. Open Invoice modal (with Settings pre-filled)
2. Manually change Business Name to "Override Company"
3. ✅ **Verify**: Change is accepted
4. ✅ **Verify**: No re-population occurs
5. Create and save invoice
6. ✅ **Verify**: Invoice saves with overridden name

**Expected Result:**

- User can override any auto-filled field
- Changes persist in current invoice
- Next invoice still uses Settings data

---

### **Test 6: GST State Auto-Detection**

1. In Settings, enter GST Number with state code (e.g., "27AABCT1234C1Z5" = Maharashtra)
2. Save Settings
3. Open Invoice modal
4. In Customer section, enter different state GST (e.g., "29AABCT1234C1Z5" = Karnataka)
5. Enable GST toggle
6. ✅ **Verify**: GST Type auto-detects as "IGST" (interstate)

**Expected Result:**

- System detects different states
- Automatically selects IGST
- Shows correct tax breakdown

---

### **Test 7: Empty Settings (First-Time User)**

1. Clear all Settings data (or use new account)
2. Open Invoice modal
3. ✅ **Verify**: Modal opens without errors
4. ✅ **Verify**: Fields are empty but usable
5. ✅ **Verify**: No crash or console errors

**Expected Result:**

- Graceful fallback to empty state
- All fields remain editable
- No JavaScript errors

---

### **Test 8: Real-Time Settings Update**

1. Open Invoice modal (data pre-filled)
2. Close modal
3. Go to Settings and change Business Name
4. Save Settings
5. Return to Invoices and open modal again
6. ✅ **Verify**: New Business Name is shown

**Expected Result:**

- Changes in Settings immediately reflect
- No cache issues
- Always current data

---

## 🐛 Common Issues & Solutions

### Issue: Fields not auto-populating

**Solution:**

- Check if Settings were saved successfully
- Verify BusinessContext is properly loaded
- Check browser console for errors

### Issue: Badge not showing

**Solution:**

- Verify `businessProfile` has data
- Check CSS classes applied correctly
- Inspect element to debug styling

### Issue: Address format incorrect

**Solution:**

- Verify all address components in Settings
- Check for null/undefined values
- Ensure proper filtering of empty fields

---

## 📊 Success Criteria

### All Tests Must Pass:

- [ ] Basic auto-population works
- [ ] Address concatenates correctly
- [ ] Currency syncs properly
- [ ] Handles partial data gracefully
- [ ] User can override fields
- [ ] GST detection works
- [ ] Empty settings handled
- [ ] Real-time updates work

### Performance Checks:

- [ ] Modal opens in < 500ms
- [ ] No lag when typing
- [ ] Toast appears immediately
- [ ] No console errors
- [ ] No memory leaks

### Visual Checks:

- [ ] Badge displays correctly
- [ ] Toast notification shows
- [ ] All fields properly formatted
- [ ] UI remains responsive
- [ ] Dark mode works

---

## 🎯 Quick Verification Command

```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Run build
npm run build
```

---

## ✅ Sign-Off

After completing all tests:

**Date Tested:** ****\_\_\_****
**Tested By:** ****\_\_\_****
**Result:** [ ] Pass [ ] Fail
**Notes:** ****\_\_\_****

---

**🎉 Happy Testing!**
