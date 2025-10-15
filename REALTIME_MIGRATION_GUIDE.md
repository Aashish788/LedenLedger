# 🔄 Migration Guide - Converting Existing Components to Real-Time

## Overview

This guide shows you how to convert your existing components to use the new real-time sync system.

---

## 🎯 Migration Patterns

### Pattern 1: Simple List Component

**BEFORE:**

```typescript
function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const response = await fetch("/api/customers");
    const data = await response.json();
    setCustomers(data);
    setLoading(false);
  };

  const handleAdd = async (customer) => {
    await fetch("/api/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });
    await fetchCustomers(); // Manual refetch
  };

  return <div>...</div>;
}
```

**AFTER:**

```typescript
function CustomersPage() {
  const {
    data: customers,
    create,
    isLoading: loading,
  } = useRealtimeData<Customer>("customers");

  const handleAdd = async (customer) => {
    await create(customer);
    // No manual refetch needed! 🎉
  };

  return <div>...</div>;
}
```

---

### Pattern 2: Component with useCustomers Hook

**BEFORE:**

```typescript
// Your current implementation
function CustomersPage() {
  const { data: supabaseCustomers, isLoading, refetch } = useCustomers();

  const handleAdd = async (customer) => {
    await createCustomer(customer);
    await refetch(); // Manual refetch
  };

  return <div>...</div>;
}
```

**AFTER:**

```typescript
function CustomersPage() {
  const {
    data: customers,
    create,
    update,
    remove,
    isLoading,
  } = useRealtimeData<Customer>("customers");

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      const { data } = await customersService.fetchCustomers();
      if (data) setData(data);
    };
    loadInitialData();
  }, []);

  const handleAdd = async (customer) => {
    await create(customer);
    // Auto-updates! No refetch needed
  };

  return <div>...</div>;
}
```

---

### Pattern 3: Add/Edit Modal

**BEFORE:**

```typescript
function AddCustomerModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createCustomer(data);
      onSuccess(); // Parent refetches
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return <Dialog>...</Dialog>;
}
```

**AFTER:**

```typescript
function AddCustomerModal({ open, onClose }) {
  const { create, isCreating } = useRealtimeCRUD<Customer>("customers");

  const handleSubmit = async (data) => {
    const result = await create(data);
    if (result) {
      toast.success("Customer added!");
      onClose();
      // Parent component auto-updates via real-time!
    }
  };

  return (
    <Dialog>
      {/* ... */}
      <Button onClick={handleSubmit} disabled={isCreating}>
        {isCreating ? "Adding..." : "Add Customer"}
      </Button>
    </Dialog>
  );
}
```

---

### Pattern 4: Detail View with Transactions

**BEFORE:**

```typescript
function CustomerDetail({ customerId }) {
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadCustomer();
    loadTransactions();
  }, [customerId]);

  const loadCustomer = async () => {
    const data = await fetchCustomer(customerId);
    setCustomer(data);
  };

  const loadTransactions = async () => {
    const data = await fetchTransactions(customerId);
    setTransactions(data);
  };

  const handleAddTransaction = async (transaction) => {
    await createTransaction(transaction);
    await loadTransactions(); // Manual refetch
    await loadCustomer(); // Update balance
  };

  return <div>...</div>;
}
```

**AFTER:**

```typescript
function CustomerDetail({ customerId }) {
  const { data: transactions, create: createTransaction } =
    useRealtimeData<Transaction>("transactions", {
      filter: `party_id=eq.${customerId}`,
    });

  const { data: customers } = useRealtimeData<Customer>("customers", {
    filter: `id=eq.${customerId}`,
  });

  const customer = customers[0];

  const handleAddTransaction = async (transaction) => {
    await createTransaction(transaction);
    // Both customer and transactions auto-update! 🎉
  };

  return <div>...</div>;
}
```

---

### Pattern 5: Search/Filter Component

**BEFORE:**

```typescript
function SearchableCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const searchCustomers = async (query) => {
    setLoading(true);
    const data = await fetch(`/api/customers?search=${query}`);
    setCustomers(data);
    setLoading(false);
  };

  return <div>...</div>;
}
```

**AFTER:**

```typescript
function SearchableCustomers() {
  const { data: allCustomers } = useRealtimeData<Customer>("customers");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter client-side (fast!)
  const customers = useMemo(() => {
    return allCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );
  }, [allCustomers, searchQuery]);

  return <div>...</div>;
}
```

---

## 🔧 Step-by-Step Migration

### Step 1: Update Imports

```typescript
// Remove old imports
// import { useCustomers } from '@/hooks/useUserData';

// Add new imports
import { useRealtimeData } from "@/hooks/useRealtimeSync";
import {
  customersService,
  type Customer,
} from "@/services/api/customersService";
```

### Step 2: Replace State Management

```typescript
// Remove
const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(true);

// Add
const {
  data: customers,
  setData: setCustomers, // For manual updates if needed
  isLoading: loading,
} = useRealtimeData<Customer>("customers");
```

### Step 3: Replace CRUD Operations

```typescript
// Remove manual fetch functions
const fetchCustomers = async () => { ... };
const createCustomer = async () => { ... };
const updateCustomer = async () => { ... };
const deleteCustomer = async () => { ... };

// Use hook methods
const { create, update, remove } = useRealtimeData<Customer>('customers');
```

### Step 4: Remove Manual Refetches

```typescript
// Remove all these:
await refetch();
await fetchCustomers();
await reload();
loadData();

// Not needed anymore! Real-time handles it automatically.
```

### Step 5: Add Initial Data Load (Optional)

```typescript
useEffect(() => {
  const loadInitialData = async () => {
    const { data } = await customersService.fetchCustomers();
    if (data) setCustomers(data);
  };
  loadInitialData();
}, []);
```

---

## 📝 Component Examples

### Example 1: Customers.tsx

```typescript
// src/pages/Customers.tsx
import { useState, useEffect, useMemo } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeSync";
import {
  customersService,
  type Customer,
} from "@/services/api/customersService";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

export default function Customers() {
  const {
    data: customers,
    setData: setCustomers,
    create,
    update,
    remove,
    isLoading,
  } = useRealtimeData<Customer>("customers");

  const [searchQuery, setSearchQuery] = useState("");

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      const { data } = await customersService.fetchCustomers();
      if (data) setCustomers(data);
    };
    loadData();
  }, []);

  // Filter
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const handleAdd = async (data: any) => {
    await create(data);
    toast.success("Customer added!");
  };

  const handleUpdate = async (id: string, data: any) => {
    await update(id, data);
    toast.success("Customer updated!");
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    toast.success("Customer deleted!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Customers</h1>
        <SyncStatusIndicator />
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <div>
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onUpdate={(data) => handleUpdate(customer.id, data)}
              onDelete={() => handleDelete(customer.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example 2: AddCustomerModal.tsx

```typescript
// src/components/AddCustomerModal.tsx
import { useState } from "react";
import { useRealtimeCRUD } from "@/hooks/useRealtimeSync";
import { Dialog } from "@/components/ui/dialog";

export function AddCustomerModal({ open, onClose }) {
  const { create, isCreating } = useRealtimeCRUD("customers");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    amount: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await create(formData);

    if (result) {
      toast.success("Customer added and synced!");
      onClose();
      setFormData({ name: "", phone: "", email: "", amount: 0 });
    } else {
      toast.error("Failed to add customer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <form onSubmit={handleSubmit}>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
          required
        />
        <input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Phone"
          required
        />
        <button type="submit" disabled={isCreating}>
          {isCreating ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </Dialog>
  );
}
```

### Example 3: Suppliers.tsx

```typescript
// src/pages/Suppliers.tsx
import { useRealtimeData } from "@/hooks/useRealtimeSync";
import type { Supplier } from "@/services/api/suppliersService";

export default function Suppliers() {
  const {
    data: suppliers,
    create,
    update,
    remove,
    isLoading,
  } = useRealtimeData<Supplier>("suppliers");

  // Same pattern as Customers!

  return <div>...</div>;
}
```

### Example 4: Transactions.tsx

```typescript
// src/pages/Transactions.tsx
import { useRealtimeData } from "@/hooks/useRealtimeSync";
import type { Transaction } from "@/services/api/transactionsService";

export default function Transactions() {
  const {
    data: transactions,
    create,
    isLoading,
  } = useRealtimeData<Transaction>("transactions");

  const handleAddTransaction = async (data: any) => {
    await create(data);
    // Customer balance updates automatically via service!
  };

  return <div>...</div>;
}
```

---

## ⚠️ Common Migration Issues

### Issue 1: "Type mismatch"

**Problem:**

```typescript
const { data: customers } = useRealtimeData("customers");
// customers is Customer[] but component expects different shape
```

**Solution:**
Transform data after fetching:

```typescript
const { data: rawCustomers } = useRealtimeData<Customer>("customers");

const customers = useMemo(() => {
  return rawCustomers.map((c) => ({
    ...c,
    balance: Math.abs(c.amount),
    balanceType: c.amount >= 0 ? "credit" : "debit",
  }));
}, [rawCustomers]);
```

### Issue 2: "Too many subscriptions"

**Problem:**
Creating subscription in a list item component

```typescript
function CustomerCard({ customerId }) {
  const { data } = useRealtimeData("customers", {
    filter: `id=eq.${customerId}`,
  });
  // Creates one subscription per customer!
}
```

**Solution:**
Subscribe at parent level:

```typescript
function CustomersList() {
  const { data: allCustomers } = useRealtimeData("customers");

  return allCustomers.map((customer) => (
    <CustomerCard customer={customer} /> // Pass data down
  ));
}
```

### Issue 3: "Initial load is slow"

**Problem:**
Waiting for subscription before showing data

**Solution:**
Load initial data immediately:

```typescript
const { data, setData } = useRealtimeData("customers");

useEffect(() => {
  // Load from cache or API immediately
  const cached = localStorage.getItem("customers");
  if (cached) {
    setData(JSON.parse(cached));
  }

  // Then fetch fresh data
  customersService.fetchCustomers().then(({ data }) => {
    if (data) setData(data);
  });
}, []);
```

---

## ✅ Migration Checklist

For each page/component:

- [ ] Import `useRealtimeData` hook
- [ ] Replace state management
- [ ] Replace CRUD functions
- [ ] Remove manual refetch calls
- [ ] Add initial data load
- [ ] Add error handling
- [ ] Test add/edit/delete
- [ ] Test real-time updates
- [ ] Test offline mode
- [ ] Add loading states
- [ ] Add sync status indicator

---

## 🎯 Testing After Migration

1. **Basic Functionality**

   - [ ] Can add new records
   - [ ] Can edit existing records
   - [ ] Can delete records
   - [ ] Search/filter still works
   - [ ] Sorting still works

2. **Real-Time Sync**

   - [ ] Open in 2 browsers
   - [ ] Add record in browser 1
   - [ ] Appears in browser 2
   - [ ] Update in browser 2
   - [ ] Updates in browser 1

3. **Offline Mode**

   - [ ] Go offline
   - [ ] Add records
   - [ ] See "Offline" indicator
   - [ ] Go online
   - [ ] Records sync automatically

4. **Performance**
   - [ ] Page loads quickly
   - [ ] No lag when adding records
   - [ ] Smooth scrolling
   - [ ] No memory leaks

---

## 🚀 Quick Migration Script

Here's a quick replacement pattern:

```bash
# Find all useCustomers hooks
grep -r "useCustomers" src/

# Find all refetch() calls
grep -r "refetch()" src/

# Find all manual fetch functions
grep -r "fetchCustomers" src/
```

Then replace systematically:

1. Update imports
2. Replace hook usage
3. Remove refetch calls
4. Test!

---

## 📞 Need Help?

If you get stuck:

1. Check the [Quick Start Guide](./REALTIME_QUICK_START.md)
2. Review [Full Documentation](./REALTIME_SYNC_IMPLEMENTATION.md)
3. Look at example components
4. Check browser console for errors
5. Test with 2 browser windows

---

## 🎉 You're Ready!

Follow this guide to migrate all your components to real-time sync.

**Benefits:**

- ✅ Less code to maintain
- ✅ Better user experience
- ✅ Automatic synchronization
- ✅ Offline support
- ✅ Optimistic updates

**Happy Migrating! 🚀**
