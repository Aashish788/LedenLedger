# 🧪 Quick Testing Guide - Product Selection Feature

## 🎯 Purpose

Verify that products can be selected from inventory and added to invoice items seamlessly.

---

## ✅ Prerequisites

1. Have some products in Inventory
2. Navigate to Invoices page
3. Have business settings configured

---

## 🔥 Test Scenarios

### **Test 1: Basic Product Selection**

1. Click **"Create Invoice"** button
2. Scroll to **Items** section
3. Click **"Select Products"** button
4. ✅ **Verify**: Product Selection Modal opens
5. ✅ **Verify**: Products from inventory are displayed
6. Click on a product card
7. ✅ **Verify**: Checkbox is checked, card is highlighted
8. ✅ **Verify**: Quantity controls appear
9. Click **"Add to Invoice"** button
10. ✅ **Verify**: Modal closes
11. ✅ **Verify**: Product appears in invoice items
12. ✅ **Verify**: Toast notification shows success

**Expected Result:**

- Product details auto-filled in invoice
- Name, price, quantity all correct
- Amount calculated properly

---

### **Test 2: Multi-Product Selection**

1. Open **"Select Products"** modal
2. Select **3 different products**
3. Adjust quantities for each
4. ✅ **Verify**: Badge shows "3 selected"
5. ✅ **Verify**: Each product shows its quantity
6. Click **"Add to Invoice (3)"**
7. ✅ **Verify**: All 3 products added to invoice
8. ✅ **Verify**: Toast shows "Added 3 products to invoice"

**Expected Result:**

- All 3 products listed in items
- Each with correct details
- Totals calculated properly

---

### **Test 3: Search Functionality**

1. Open product selection modal
2. Type **"laptop"** in search box
3. ✅ **Verify**: Only matching products shown
4. Clear search
5. ✅ **Verify**: All products shown again
6. Search by **SKU** or **barcode**
7. ✅ **Verify**: Search works for all fields

**Expected Result:**

- Search is case-insensitive
- Filters instantly
- Shows relevant products only

---

### **Test 4: Category Filtering**

1. Open product selection modal
2. Click **Category dropdown**
3. Select **"Electronics"**
4. ✅ **Verify**: Only electronics shown
5. Select **"All Categories"**
6. ✅ **Verify**: All products shown again

**Expected Result:**

- Categories are dynamically loaded
- Filtering works instantly
- Can switch between categories

---

### **Test 5: Stock Status Indicators**

1. Open product selection modal
2. Find product with **0 quantity** (if exists)
3. ✅ **Verify**: Shows "Out of Stock" red badge
4. ✅ **Verify**: Cannot be selected (disabled)
5. Find product with **low stock**
6. ✅ **Verify**: Shows "Low Stock" yellow badge
7. Find product with **good stock**
8. ✅ **Verify**: Shows "In Stock" green badge

**Expected Result:**

- Stock status clearly visible
- Out-of-stock products disabled
- Color coding is intuitive

---

### **Test 6: Quantity Controls**

1. Select a product
2. Click **[-]** button
3. ✅ **Verify**: Quantity decreases
4. ✅ **Verify**: Can't go below 1
5. Click **[+]** button
6. ✅ **Verify**: Quantity increases
7. ✅ **Verify**: Can't exceed available stock
8. Type quantity manually
9. ✅ **Verify**: Total updates in real-time

**Expected Result:**

- Quantity controls work smoothly
- Validation prevents invalid values
- Live total calculation

---

### **Test 7: Combined Search + Filter**

1. Open product selection modal
2. Type **"wireless"** in search
3. Select **"Electronics"** category
4. ✅ **Verify**: Shows only wireless electronics
5. Clear search, keep category
6. ✅ **Verify**: Shows all electronics

**Expected Result:**

- Both filters work together
- Results are accurate
- No UI glitches

---

### **Test 8: Manual + Selected Products**

1. Click **"Select Products"**
2. Add 2 products from inventory
3. Click **"Add Manually"**
4. Add a custom service item
5. ✅ **Verify**: Invoice has 3 items total
6. ✅ **Verify**: Mix of inventory and manual items
7. ✅ **Verify**: All editable

**Expected Result:**

- Both methods work together
- No conflicts
- Full flexibility maintained

---

### **Test 9: Empty Inventory**

1. Ensure inventory has 0 products
2. Open **"Select Products"** modal
3. ✅ **Verify**: Shows empty state message
4. ✅ **Verify**: Suggests adding products
5. ✅ **Verify**: No errors or crashes

**Expected Result:**

- Graceful empty state
- Clear messaging
- User knows what to do

---

### **Test 10: Product Details Accuracy**

1. In **Inventory**, note a product's details:
   - Name: "Dell Laptop"
   - Price: ₹45,000
   - HSN: 8471
   - Stock: 10 units
2. Open invoice modal
3. Select that product
4. ✅ **Verify**: All details match exactly
5. ✅ **Verify**: Price is correct
6. ✅ **Verify**: HSN is filled
7. Save invoice
8. ✅ **Verify**: Saved data matches

**Expected Result:**

- 100% data accuracy
- No transcription errors
- All fields populated

---

### **Test 11: Stock Validation**

1. Find product with **5 units** in stock
2. Select it in modal
3. Try to set quantity to **10**
4. ✅ **Verify**: Can't exceed 5
5. ✅ **Verify**: + button disabled at max
6. ✅ **Verify**: Warning shown (if any)

**Expected Result:**

- Cannot oversell stock
- Clear validation
- User understands limits

---

### **Test 12: UI Responsiveness**

1. Open modal on **desktop**
2. ✅ **Verify**: Full-width modal, 5 columns
3. Resize to **tablet**
4. ✅ **Verify**: Layout adjusts
5. Resize to **mobile**
6. ✅ **Verify**: Still usable, scrollable

**Expected Result:**

- Responsive design works
- Touch-friendly on mobile
- No horizontal scroll

---

### **Test 13: Cancel & Close**

1. Open product selection modal
2. Select 3 products
3. Adjust quantities
4. Click **"Cancel"** button
5. ✅ **Verify**: Modal closes
6. ✅ **Verify**: No products added to invoice
7. Open modal again
8. ✅ **Verify**: Previous selection cleared
9. Click **X** (close button)
10. ✅ **Verify**: Same behavior as Cancel

**Expected Result:**

- Cancel works properly
- State resets on reopen
- No unintended additions

---

### **Test 14: Performance with Many Products**

1. Ensure inventory has **50+ products**
2. Open product selection modal
3. ✅ **Verify**: Loads quickly (< 1 second)
4. Scroll through list
5. ✅ **Verify**: Smooth scrolling
6. Type in search
7. ✅ **Verify**: Instant filtering
8. Select multiple products
9. ✅ **Verify**: No lag

**Expected Result:**

- Fast performance
- No stuttering
- Efficient rendering

---

### **Test 15: Real-Time Inventory Sync**

1. Open product selection modal
2. In another tab, update product in Inventory
3. Return to invoice modal
4. ✅ **Verify**: Changes reflected (may need refresh)
5. Add product to invoice
6. ✅ **Verify**: Latest data used

**Expected Result:**

- Real-time sync works
- Data always current
- No stale information

---

## 🐛 Common Issues & Solutions

### Issue: Products not showing

**Solution:**

- Check if products exist in Inventory
- Verify InventoryContext is loaded
- Check browser console for errors

### Issue: Can't select product

**Solution:**

- Check if product is out of stock
- Verify stock quantity > 0
- Check for JavaScript errors

### Issue: Quantities not updating

**Solution:**

- Ensure product is selected first
- Check min/max validation
- Verify state updates

### Issue: Toast not showing

**Solution:**

- Check Sonner toast provider
- Verify toast import
- Check browser notifications

---

## 📊 Success Criteria

### All Tests Must Pass:

- [ ] Basic selection works
- [ ] Multi-product selection works
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Stock status shows correctly
- [ ] Quantity controls work
- [ ] Combined filters work
- [ ] Manual + selected mix works
- [ ] Empty state handled
- [ ] Data accuracy 100%
- [ ] Stock validation works
- [ ] Responsive design works
- [ ] Cancel/close works
- [ ] Performance is good
- [ ] Real-time sync works

### Visual Checks:

- [ ] Modal design is clean
- [ ] Product cards look good
- [ ] Badges are visible
- [ ] Icons render properly
- [ ] Colors are appropriate
- [ ] Dark mode works

### Functional Checks:

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All buttons work
- [ ] All inputs validated
- [ ] Calculations correct
- [ ] Data persists correctly

---

## 🎯 Quick Smoke Test (2 minutes)

```bash
1. Create Invoice → Select Products → Choose 1 → Add → Verify in items
2. Edit quantity in invoice → Verify calculation
3. Save invoice → Verify in database
```

**If all 3 work → Feature is ready! ✅**

---

## ✅ Sign-Off

After completing all tests:

**Date Tested:** ****\_\_\_****
**Tested By:** ****\_\_\_****
**Result:** [ ] Pass [ ] Fail
**Issues Found:** ****\_\_\_****
**Notes:** ****\_\_\_****

---

**🎉 Happy Testing!**
