# 📸 Stock In/Out - Visual User Guide

## 🎯 How to Use Stock In/Out

---

## 📥 **Stock In** (Adding Inventory)

### Step 1: Open Product Detail

- Click on any product from the Inventory list
- You'll see the product detail page with stock information

### Step 2: Click "Stock In" Button

- Look for the green **"Stock In"** button with a Plus (+) icon
- Located near the top actions area

### Step 3: Fill the Modal

```
┌─────────────────────────────────────────────┐
│  Stock In                              [X]  │
├─────────────────────────────────────────────┤
│  Add inventory to your stock                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Premium Laptop                     │   │
│  │  Current Stock: 45 Pcs              │   │
│  │                    Selling: ₹75,000 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Quantity (Pcs) *                           │
│  ┌─────────────────────────────────────┐   │
│  │ 20                                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Purchase Price per Pcs *                   │
│  ┌─────────────────────────────────────┐   │
│  │ 50000.00                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Note (Optional)                            │
│  ┌─────────────────────────────────────┐   │
│  │ Bulk purchase from supplier XYZ     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Transaction Amount: ₹10,00,000      │   │
│  │ New Stock Level: 65 Pcs             │   │
│  │ ────────────────────────────────    │   │
│  │ New Avg. Cost Price: ₹51,538.46     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│              [Cancel]  [Add Stock]          │
└─────────────────────────────────────────────┘
```

### Step 4: Click "Add Stock"

- Button shows loading spinner while processing
- Success message appears: "Stock In completed! Added 20 Pcs"
- Product page refreshes with new quantity and cost

---

## 📤 **Stock Out** (Removing Inventory)

### Step 1: Open Product Detail

- Same as Stock In

### Step 2: Click "Stock Out" Button

- Look for the red **"Stock Out"** button with a Minus (-) icon
- Located near the top actions area

### Step 3: Fill the Modal

```
┌─────────────────────────────────────────────┐
│  Stock Out                             [X]  │
├─────────────────────────────────────────────┤
│  Remove inventory from your stock           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Premium Laptop                     │   │
│  │  Current Stock: 65 Pcs              │   │
│  │                    Selling: ₹75,000 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Quantity (Pcs) *                           │
│  ┌─────────────────────────────────────┐   │
│  │ 5                                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Selling Price per Pcs *                    │
│  ┌─────────────────────────────────────┐   │
│  │ 75000.00                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Note (Optional)                            │
│  ┌─────────────────────────────────────┐   │
│  │ Sold to customer ABC Corp           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Transaction Amount: ₹3,75,000       │   │
│  │ New Stock Level: 60 Pcs             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│           [Cancel]  [Remove Stock]          │
└─────────────────────────────────────────────┘
```

### Step 4: Click "Remove Stock"

- Button shows loading spinner while processing
- Success message appears: "Stock Out completed! Removed 5 Pcs"
- Product page refreshes with new quantity

---

## ⚠️ **Validation Examples**

### ❌ Invalid: Remove more than available

```
Current Stock: 10 Pcs
You enter: 15 Pcs

Result:
┌──────────────────────────────────────┐
│  ⚠️ Insufficient stock! Only 10 Pcs │
│     available.                       │
└──────────────────────────────────────┘
[Remove Stock] button is DISABLED
```

### ❌ Invalid: Zero or negative quantity

```
You enter: 0 or -5

Result:
Toast Error: "Please enter a valid quantity"
```

### ❌ Invalid: Negative price

```
You enter: -100

Result:
Toast Error: "Please enter a valid price"
```

---

## 💡 **Pro Tips**

### 1. **Cost Price Updates** (Stock In Only)

The system automatically calculates the **weighted average cost**:

**Example:**

- Before: 100 units @ ₹50 = ₹5,000 total
- Purchase: 50 units @ ₹60 = ₹3,000 new
- After: 150 units @ ₹53.33 average ✓

This ensures accurate profit calculations!

### 2. **Transaction History**

Every Stock In/Out is saved to the database with:

- Date and time
- Quantity and price
- Transaction amount
- Your custom notes

### 3. **Quick Access**

From the Inventory list, click any product → Opens detail → Click Stock In/Out

### 4. **Keyboard Navigation**

- `Tab` to move between fields
- `Enter` to submit the form
- `Esc` to close the modal

---

## 🎨 **Visual Indicators**

### Stock Status Badges

```
┌────────────────────────────────────┐
│  Premium Laptop  [Product]         │  ← Type badge
│  SKU: LAP-001 • Electronics        │
│  Stock: 5 Pcs  [Low Stock] ⚠️      │  ← Low stock warning
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Basic Mouse  [Product]            │
│  SKU: MOU-001 • Accessories        │
│  Stock: 0 Pcs  [Out of Stock] 🔴   │  ← Out of stock alert
└────────────────────────────────────┘
```

### Color Coding

- 🟢 **Green** = Stock In button
- 🔴 **Red** = Stock Out button
- 🟡 **Yellow** = Low stock warning
- ⚫ **Gray** = Normal stock level

---

## 📊 **What Happens After Transaction**

### Stock In Flow

1. Transaction record created in database
2. Product quantity increases
3. Cost price updates to weighted average
4. Product detail page refreshes
5. Success notification shows
6. Inventory value updates

### Stock Out Flow

1. Transaction record created in database
2. Product quantity decreases
3. Cost price stays the same
4. Product detail page refreshes
5. Success notification shows
6. Inventory value updates

---

## 🔧 **Troubleshooting**

### Modal doesn't open?

- Check internet connection
- Refresh the page
- Make sure you're on the Product Detail page

### Can't submit form?

- Fill all required fields (marked with \*)
- Check for validation errors (red text)
- Ensure stock out quantity ≤ available stock

### Changes not reflecting?

- Wait for success notification
- Check if page refreshed automatically
- Manually refresh if needed (F5)

---

## 🎓 **Best Practices**

### For Stock In

✅ Always add purchase notes (supplier, invoice number)
✅ Double-check purchase price
✅ Use actual purchase price, not selling price
✅ Keep invoices for verification

### For Stock Out

✅ Add sale/removal notes (customer, reason)
✅ Use actual selling price
✅ Verify quantity before submission
✅ Match with sales records

### General

✅ Regular stock audits (compare physical vs system)
✅ Use clear, descriptive notes
✅ Check cost price updates make sense
✅ Monitor low stock alerts

---

## 🎉 **You're All Set!**

Now you can efficiently manage your inventory with accurate stock tracking and cost management!

**Need Help?** Check `STOCK_IN_OUT_COMPLETE.md` for technical details.
