/**
 * Quick Test Script for User Data Service
 * 
 * Run this file to test the data fetching functionality
 * Usage: Import and call testUserDataService() in your app
 */

import { userDataService } from '@/services/api/userDataService';

/**
 * Test the user data service
 * Call this function from your browser console or any component
 */
export async function testUserDataService() {
  console.log('🧪 ===============================================');
  console.log('🧪 TESTING USER DATA SERVICE');
  console.log('🧪 ===============================================\n');

  const startTime = performance.now();

  try {
    console.log('📡 Fetching all user data...\n');

    const response = await userDataService.fetchAllUserData();

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (response.success && response.data) {
      console.log('✅ SUCCESS! Data fetched in', duration, 'ms\n');

      const { data } = response;

      // Profile Information
      console.log('👤 PROFILE:');
      console.log('  ├─ Name:', data.profile?.full_name || 'Not set');
      console.log('  ├─ Phone:', data.profile?.phone || 'Not set');
      console.log('  └─ User ID:', data.profile?.id || 'N/A');
      console.log('');

      // Business Information
      console.log('🏢 BUSINESS SETTINGS:');
      if (data.businessSettings) {
        console.log('  ├─ Business Name:', data.businessSettings.business_name);
        console.log('  ├─ Owner:', data.businessSettings.owner_name || 'Not set');
        console.log('  ├─ Type:', data.businessSettings.business_type);
        console.log('  ├─ Currency:', data.businessSettings.currency);
        console.log('  ├─ GST Registered:', data.businessSettings.is_gst_registered ? 'Yes' : 'No');
        console.log('  └─ Country:', data.businessSettings.country);
      } else {
        console.log('  └─ No business settings found');
      }
      console.log('');

      // Statistics
      console.log('📊 STATISTICS:');
      console.log('  ├─ Customers:', data.stats.totalCustomers);
      console.log('  ├─ Suppliers:', data.stats.totalSuppliers);
      console.log('  ├─ Invoices:', data.stats.totalInvoices);
      console.log('  ├─ Cash Book Entries:', data.stats.totalCashBookEntries);
      console.log('  ├─ Staff Members:', data.stats.totalStaff);
      console.log('  └─ Transactions:', data.stats.totalTransactions);
      console.log('');

      // Recent Customers
      if (data.customers.length > 0) {
        console.log('👥 RECENT CUSTOMERS (Top 3):');
        data.customers.slice(0, 3).forEach((customer, idx) => {
          const prefix = idx === data.customers.length - 1 || idx === 2 ? '└─' : '├─';
          console.log(`  ${prefix} ${customer.name} (${customer.phone}) - Balance: ${customer.amount}`);
        });
        console.log('');
      }

      // Recent Suppliers
      if (data.suppliers.length > 0) {
        console.log('🏭 RECENT SUPPLIERS (Top 3):');
        data.suppliers.slice(0, 3).forEach((supplier, idx) => {
          const prefix = idx === data.suppliers.length - 1 || idx === 2 ? '└─' : '├─';
          console.log(`  ${prefix} ${supplier.name} (${supplier.phone}) - Balance: ${supplier.amount}`);
        });
        console.log('');
      }

      // Recent Invoices
      if (data.invoices.length > 0) {
        console.log('📄 RECENT INVOICES (Top 3):');
        data.invoices.slice(0, 3).forEach((invoice, idx) => {
          const prefix = idx === data.invoices.length - 1 || idx === 2 ? '└─' : '├─';
          console.log(`  ${prefix} #${invoice.bill_number} - ${invoice.customer_name} - ₹${invoice.total} [${invoice.status}]`);
        });
        console.log('');
      }

      // Recent Cash Book Entries
      if (data.cashBookEntries.length > 0) {
        console.log('💰 RECENT CASH BOOK ENTRIES (Top 3):');
        data.cashBookEntries.slice(0, 3).forEach((entry, idx) => {
          const prefix = idx === data.cashBookEntries.length - 1 || idx === 2 ? '└─' : '├─';
          const type = entry.type === 'in' ? '↑ IN' : '↓ OUT';
          console.log(`  ${prefix} ${type} - ₹${entry.amount} (${entry.payment_mode || 'N/A'})`);
        });
        console.log('');
      }

      // Staff Members
      if (data.staff.length > 0) {
        console.log('👨‍💼 STAFF MEMBERS:');
        data.staff.forEach((member, idx) => {
          const prefix = idx === data.staff.length - 1 ? '└─' : '├─';
          const status = member.is_active ? '✓ Active' : '✗ Inactive';
          console.log(`  ${prefix} ${member.name} - ${member.position} - ₹${member.monthly_salary} [${status}]`);
        });
        console.log('');
      }

      console.log('🎉 ===============================================');
      console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
      console.log('🎉 ===============================================\n');

      console.log('📋 RESPONSE OBJECT:', response);
      console.log('');
      console.log('💡 TIP: You can access the data object with:');
      console.log('   const { data } = await userDataService.fetchAllUserData();');
      console.log('');

      return response;

    } else {
      console.error('❌ FAILED!');
      console.error('Error:', response.error);
      console.error('Response:', response);

      console.log('');
      console.log('🔍 TROUBLESHOOTING:');
      console.log('  1. Check if user is logged in');
      console.log('  2. Verify Supabase connection');
      console.log('  3. Check browser console for errors');
      console.log('  4. Verify RLS policies are enabled');
      console.log('');

      return response;
    }

  } catch (error) {
    console.error('❌ EXCEPTION OCCURRED!');
    console.error('Error:', error);
    console.log('');
    console.log('🔍 This is likely a code error. Check:');
    console.log('  1. Import statements');
    console.log('  2. Supabase client configuration');
    console.log('  3. Network connectivity');
    console.log('');

    throw error;
  }
}

/**
 * Test specific data types only
 */
export async function testSpecificData() {
  console.log('🧪 Testing specific data fetch (customers & suppliers only)...\n');

  const response = await userDataService.fetchSpecificData([
    'customers',
    'suppliers'
  ]);

  if (response.success && response.data) {
    console.log('✅ SUCCESS!');
    console.log('Customers:', response.data.customers?.length || 0);
    console.log('Suppliers:', response.data.suppliers?.length || 0);
  } else {
    console.error('❌ FAILED:', response.error);
  }

  return response;
}

/**
 * Test data refresh
 */
export async function testRefresh() {
  console.log('🧪 Testing data refresh...\n');

  const response = await userDataService.refreshAllData();

  if (response.success && response.data) {
    console.log('✅ Data refreshed successfully!');
    console.log('Stats:', response.data.stats);
  } else {
    console.error('❌ Refresh failed:', response.error);
  }

  return response;
}

/**
 * Quick inline test - call this in browser console
 */
export async function quickTest() {
  const response = await userDataService.fetchAllUserData();
  console.log(response.success ? '✅ Working!' : '❌ Failed!', response);
  return response;
}

// Auto-export for easy testing
if (typeof window !== 'undefined') {
  (window as any).testUserDataService = testUserDataService;
  (window as any).testSpecificData = testSpecificData;
  (window as any).testRefresh = testRefresh;
  (window as any).quickTest = quickTest;
  
  console.log('🧪 Test functions loaded! Try:');
  console.log('  - testUserDataService()');
  console.log('  - testSpecificData()');
  console.log('  - testRefresh()');
  console.log('  - quickTest()');
}
