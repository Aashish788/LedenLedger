# ⚡ Real-Time Sync - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Enable Supabase Realtime (IMPORTANT!)

You need to enable Realtime for your tables in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Enable Realtime for these tables:

   - ✅ `customers`
   - ✅ `suppliers`
   - ✅ `transactions`
   - ✅ `bills`
   - ✅ `cashbook_entries`
   - ✅ `staff`
   - ✅ `attendance`
   - ✅ `business_settings`
   - ✅ `profiles`

4. Make sure RLS policies allow SELECT for authenticated users

### Step 2: Install Dependencies (if needed)

```bash
# Already included in your package.json
npm install @supabase/supabase-js
```

### Step 3: Use in Your Components

#### Option A: Simple Real-Time List (Recommended)

```typescript
import { useRealtimeData } from "@/hooks/useRealtimeSync";
import { Customer } from "@/services/api/customersService";

function CustomersPage() {
  const {
    data: customers, // Auto-syncing list
    create, // Add new customer
    update, // Update customer
    remove, // Delete customer
    isLoading, // Loading state
    isCreating, // Creating state
    isUpdating, // Updating state
    isDeleting, // Deleting state
  } = useRealtimeData<Customer>("customers");

  // That's it! Your list now syncs in real-time! 🎉

  return (
    <div>
      {customers.map((customer) => (
        <div key={customer.id}>
          {customer.name}
          <button onClick={() => update(customer.id, { name: "New Name" })}>
            Edit
          </button>
          <button onClick={() => remove(customer.id)}>Delete</button>
        </div>
      ))}

      <button onClick={() => create({ name: "John", phone: "123" })}>
        Add Customer
      </button>
    </div>
  );
}
```

#### Option B: Just Real-Time Subscription (No CRUD)

```typescript
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

function CustomersPage() {
  const { data: customers, isLoading } = useRealtimeSync<Customer>(
    "customers",
    {
      filter: "deleted_at=is.null",
      onInsert: (payload) => {
        toast.success(`${payload.new.name} was added!`);
      },
    }
  );

  return <div>...</div>;
}
```

#### Option C: Just CRUD Operations (No Subscription)

```typescript
import { useRealtimeCRUD } from "@/hooks/useRealtimeSync";

function AddCustomerForm() {
  const { create, isCreating } = useRealtimeCRUD<Customer>("customers");

  const handleSubmit = async (data) => {
    await create(data);
    toast.success("Customer added!");
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Step 4: Add Sync Status Indicator

```typescript
// In your main layout or dashboard
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

function Layout() {
  return (
    <div>
      <header>
        <h1>My App</h1>
        <SyncStatusIndicator /> {/* Shows online/offline/pending */}
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## 📝 Quick Examples

### Example 1: Customers with Real-Time

```typescript
import { useRealtimeData } from "@/hooks/useRealtimeSync";
import { customersService, Customer } from "@/services/api/customersService";

function Customers() {
  const {
    data: customers,
    create,
    update,
    remove,
  } = useRealtimeData<Customer>("customers");

  return (
    <div>
      <button
        onClick={() =>
          create({ name: "John Doe", phone: "1234567890", amount: 0 })
        }
      >
        Add Customer
      </button>

      {customers.map((c) => (
        <div key={c.id}>
          <span>{c.name}</span>
          <button onClick={() => update(c.id, { name: "Updated Name" })}>
            Edit
          </button>
          <button onClick={() => remove(c.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Add Customer Modal

```typescript
function AddCustomerModal({ open, onClose }) {
  const { create, isCreating } = useRealtimeCRUD("customers");
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const handleSubmit = async () => {
    await create(formData);
    toast.success("Customer added and synced!");
    onClose();
  };

  return (
    <Dialog open={open}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <button onClick={handleSubmit} disabled={isCreating}>
        {isCreating ? "Adding..." : "Add Customer"}
      </button>
    </Dialog>
  );
}
```

### Example 3: Transactions

```typescript
import { transactionsService } from "@/services/api/transactionsService";

function AddTransaction({ customerId }) {
  const { create } = useRealtimeCRUD("transactions");

  const handleAdd = async () => {
    await create({
      party_id: customerId,
      party_type: "customer",
      type: "got",
      amount: 1000,
      date: new Date().toISOString(),
    });
    // Customer balance updates automatically!
  };

  return <button onClick={handleAdd}>Add Transaction</button>;
}
```

---

## 🎯 What You Get

### ✅ Automatic Features

1. **Real-Time Updates**

   - Add customer on Device A → Instantly appears on Device B
   - Update on mobile → Desktop updates immediately
   - Delete anywhere → Removed everywhere

2. **Offline Support**

   - No internet? No problem!
   - All changes queued
   - Auto-syncs when online

3. **Optimistic Updates**

   - UI updates instantly
   - No waiting for server
   - Smooth user experience

4. **Error Handling**

   - Automatic retries
   - User-friendly errors
   - Fallback to offline mode

5. **Connection Management**
   - Auto-reconnect on disconnect
   - Exponential backoff
   - No memory leaks

---

## 🔧 Configuration

### Enable/Disable Real-Time

```typescript
const { data } = useRealtimeData("customers", {
  enabled: isOnline, // Only subscribe when online
});
```

### Filter Data

```typescript
const { data } = useRealtimeData("customers", {
  filter: "deleted_at=is.null AND amount>0", // Supabase filter syntax
});
```

### Custom Callbacks

```typescript
const { data } = useRealtimeSync("customers", {
  onInsert: (payload) => console.log("Inserted:", payload.new),
  onUpdate: (payload) => console.log("Updated:", payload.new),
  onDelete: (payload) => console.log("Deleted:", payload.old),
});
```

---

## 🧪 Testing Real-Time

### Test in Browser

1. Open your app in two browser windows
2. Side by side
3. Add a customer in window 1
4. Watch it appear in window 2 instantly! 🎉

### Test Offline Mode

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Select **Offline** from dropdown
4. Add a customer → Shows "Offline Mode"
5. Go back **Online**
6. Watch it sync automatically!

### Test Multiple Devices

1. Open app on phone
2. Open app on desktop
3. Make changes on phone
4. Watch desktop update in real-time!

---

## 🐛 Common Issues

### Issue: "Not syncing"

**Check:**

```typescript
// Is Realtime enabled in Supabase?
// Are you authenticated?
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("User:", user);

// Check sync status
const { syncStatus } = useSyncStatus();
console.log("Status:", syncStatus);
```

### Issue: "Duplicate updates"

**Fix:** Make sure you're not creating multiple subscriptions

```typescript
useEffect(() => {
  const unsubscribe = subscribe(...);
  return () => unsubscribe();  // ← Important!
}, []);
```

### Issue: "Slow performance"

**Optimize:**

```typescript
// Add pagination
const { data } = await customersService.fetchCustomers({
  limit: 50,
  offset: 0,
});

// Add filters
const { data } = useRealtimeData("customers", {
  filter: "deleted_at=is.null", // Only active records
});
```

---

## 📊 API Reference

### `useRealtimeData<T>(table, options?)`

Returns:

- `data: T[]` - Auto-syncing array
- `setData: (data: T[]) => void` - Manual update
- `create: (data) => Promise<T>` - Add new record
- `update: (id, data) => Promise<T>` - Update record
- `remove: (id) => Promise<boolean>` - Delete record
- `batchCreate: (records) => Promise<T[]>` - Add multiple
- `isLoading: boolean` - Loading state
- `isCreating: boolean` - Creating state
- `isUpdating: boolean` - Updating state
- `isDeleting: boolean` - Deleting state
- `error: Error | null` - Error state

### `useSyncStatus()`

Returns:

- `syncStatus: SyncStatus` - Current status
  - `isOnline: boolean` - Has internet
  - `isConnected: boolean` - Connected to Supabase
  - `pendingOperations: number` - Queued changes
  - `lastSync: number | null` - Last sync timestamp
  - `error: string | null` - Error message
- `forceSync: () => void` - Manually trigger sync
- `clearQueue: () => void` - Clear offline queue

---

## 🎨 UI Components

### Sync Status Badge

```typescript
import { useSyncStatus } from "@/hooks/useRealtimeSync";

function SyncBadge() {
  const { syncStatus } = useSyncStatus();

  if (!syncStatus.isOnline) {
    return <Badge variant="warning">Offline</Badge>;
  }

  if (syncStatus.pendingOperations > 0) {
    return (
      <Badge variant="info">Syncing {syncStatus.pendingOperations}...</Badge>
    );
  }

  return <Badge variant="success">Synced</Badge>;
}
```

### Loading Skeleton

```typescript
function CustomersList() {
  const { data: customers, isLoading } = useRealtimeData("customers");

  if (isLoading) {
    return <Skeleton count={5} />;
  }

  return customers.map((c) => <CustomerCard key={c.id} customer={c} />);
}
```

---

## ✅ Checklist

Before going live:

- [ ] Enabled Realtime for all tables in Supabase
- [ ] Tested add/edit/delete on two devices
- [ ] Tested offline mode
- [ ] Added SyncStatusIndicator to layout
- [ ] Tested with poor network (throttling)
- [ ] Added error handling
- [ ] Tested with multiple users
- [ ] Verified RLS policies
- [ ] Added loading states
- [ ] Tested on mobile devices

---

## 🚀 Next Steps

1. **Update Your Customers Page**

   ```typescript
   // Replace your current implementation with:
   const { data, create, update, remove } =
     useRealtimeData<Customer>("customers");
   ```

2. **Add to Suppliers Page**

   ```typescript
   const { data, create, update, remove } =
     useRealtimeData<Supplier>("suppliers");
   ```

3. **Add to Transactions**

   ```typescript
   const { data, create } = useRealtimeData<Transaction>("transactions");
   ```

4. **Test Everything!**
   - Open in 2 browsers
   - Make changes
   - Watch the magic! ✨

---

## 🎉 You're Done!

Your app now has **industry-standard real-time sync** like Khatabook and Vyapar!

**Features you get for free:**

- ✅ Real-time updates across devices
- ✅ Offline support with auto-sync
- ✅ Optimistic updates for instant UI
- ✅ Automatic error handling
- ✅ Connection management
- ✅ Type safety
- ✅ Memory efficient
- ✅ Production-ready

**Happy Building! 🚀**
