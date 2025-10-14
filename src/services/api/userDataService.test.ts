/**
 * User Data Service - Test & Verification Script
 * 
 * This file demonstrates how to use the userDataService and includes
 * test functions to verify the implementation.
 * 
 * @version 1.0.0
 */

import { userDataService, type UserDataResponse } from './userDataService';

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test fetching all user data
 */
export async function testFetchAllUserData(): Promise<void> {
  console.log('='.repeat(70));
  console.log('TEST: Fetching All User Data');
  console.log('='.repeat(70));

  try {
    const result: UserDataResponse = await userDataService.fetchAllUserData();

    if (result.success) {
      console.log('✅ Success! User data fetched successfully');
      console.log('\n📊 Data Counts:');
      console.log(`   - Customers: ${result.metadata.counts.customers}`);
      console.log(`   - Suppliers: ${result.metadata.counts.suppliers}`);
      console.log(`   - Invoices: ${result.metadata.counts.invoices}`);
      console.log(`   - Cash Book Entries: ${result.metadata.counts.cashBook}`);
      console.log(`   - Staff Members: ${result.metadata.counts.staff}`);
      console.log(`   - Transactions: ${result.metadata.counts.transactions}`);

      if (result.data.profile) {
        console.log('\n👤 User Profile:');
        console.log(`   - Name: ${result.data.profile.full_name || 'Not set'}`);
        console.log(`   - Phone: ${result.data.profile.phone || 'Not set'}`);
      }

      if (result.data.businessSettings) {
        console.log('\n🏢 Business Settings:');
        console.log(`   - Business Name: ${result.data.businessSettings.business_name}`);
        console.log(`   - Owner Name: ${result.data.businessSettings.owner_name || 'Not set'}`);
        console.log(`   - Business Type: ${result.data.businessSettings.business_type}`);
        console.log(`   - Currency: ${result.data.businessSettings.currency}`);
        console.log(`   - GST Registered: ${result.data.businessSettings.is_gst_registered ? 'Yes' : 'No'}`);
      }

      console.log('\n⏱️  Metadata:');
      console.log(`   - Fetched At: ${result.metadata.fetchedAt}`);
      console.log(`   - User ID: ${result.metadata.userId}`);

    } else {
      console.error('❌ Error fetching user data:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }

  console.log('='.repeat(70));
}

/**
 * Test fetching specific data types
 */
export async function testFetchSpecificData(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST: Fetching Specific Data Types');
  console.log('='.repeat(70));

  const dataTypes = [
    'profile',
    'business',
    'customers',
    'suppliers',
    'invoices',
    'cashBook',
    'staff',
    'transactions'
  ] as const;

  for (const dataType of dataTypes) {
    try {
      console.log(`\n📥 Fetching ${dataType}...`);
      const result = await userDataService.fetchSpecificData(dataType);

      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      } else {
        if (Array.isArray(result.data)) {
          console.log(`   ✅ Success: ${result.data.length} items fetched`);
        } else if (result.data) {
          console.log(`   ✅ Success: Data fetched`);
        } else {
          console.log(`   ℹ️  No data found`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Exception:`, error);
    }
  }

  console.log('='.repeat(70));
}

/**
 * Test refresh functionality
 */
export async function testRefreshUserData(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST: Refresh User Data');
  console.log('='.repeat(70));

  try {
    console.log('🔄 Refreshing user data...');
    const result = await userDataService.refreshUserData();

    if (result.success) {
      console.log('✅ Data refreshed successfully');
      console.log(`   Total items: ${
        result.metadata.counts.customers +
        result.metadata.counts.suppliers +
        result.metadata.counts.invoices +
        result.metadata.counts.cashBook +
        result.metadata.counts.staff +
        result.metadata.counts.transactions
      }`);
    } else {
      console.error('❌ Refresh failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }

  console.log('='.repeat(70));
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(15) + 'USER DATA SERVICE - TEST SUITE' + ' '.repeat(22) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');
  console.log('\n');

  await testFetchAllUserData();
  await testFetchSpecificData();
  await testRefreshUserData();

  console.log('\n\n');
  console.log('✨ All tests completed!');
  console.log('\n');
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic usage - Fetch all data on login
 */
export async function exampleBasicUsage(): Promise<void> {
  // Import the service
  // import { userDataService } from '@/services/api/userDataService';

  // Fetch all user data
  const response = await userDataService.fetchAllUserData();

  if (response.success) {
    // Access the data
    const customers = response.data.customers;
    const suppliers = response.data.suppliers;
    const businessSettings = response.data.businessSettings;

    console.log('Customers:', customers);
    console.log('Business Name:', businessSettings?.business_name);
  } else {
    console.error('Error:', response.error);
  }
}

/**
 * Example 2: Fetch specific data type
 */
export async function exampleFetchSpecific(): Promise<void> {
  // Fetch only customers
  const customersResult = await userDataService.fetchSpecificData('customers');

  if (customersResult.data) {
    console.log('Customers:', customersResult.data);
  }

  // Fetch only business settings
  const businessResult = await userDataService.fetchSpecificData('business');

  if (businessResult.data) {
    console.log('Business:', businessResult.data);
  }
}

/**
 * Example 3: Use in React component with useEffect
 */
export function exampleReactComponent() {
  /*
  import { useState, useEffect } from 'react';
  import { userDataService, type UserDataResponse } from '@/services/api/userDataService';

  function Dashboard() {
    const [userData, setUserData] = useState<UserDataResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      async function loadUserData() {
        setIsLoading(true);
        try {
          const response = await userDataService.fetchAllUserData();
          setUserData(response);
        } catch (error) {
          console.error('Failed to load user data:', error);
        } finally {
          setIsLoading(false);
        }
      }

      loadUserData();
    }, []);

    if (isLoading) return <div>Loading...</div>;

    if (!userData?.success) {
      return <div>Error: {userData?.error}</div>;
    }

    return (
      <div>
        <h1>Welcome, {userData.data.businessSettings?.business_name}</h1>
        <p>Customers: {userData.metadata.counts.customers}</p>
        <p>Suppliers: {userData.metadata.counts.suppliers}</p>
      </div>
    );
  }
  */
}

/**
 * Example 4: Use with Context Provider
 */
export function exampleWithContext() {
  /*
  import { createContext, useContext, useState, useEffect } from 'react';
  import { userDataService, type UserDataResponse } from '@/services/api/userDataService';

  const UserDataContext = createContext<UserDataResponse | null>(null);

  export function UserDataProvider({ children }) {
    const [userData, setUserData] = useState<UserDataResponse | null>(null);

    useEffect(() => {
      async function init() {
        const data = await userDataService.fetchAllUserData();
        setUserData(data);
      }
      init();
    }, []);

    return (
      <UserDataContext.Provider value={userData}>
        {children}
      </UserDataContext.Provider>
    );
  }

  export function useUserData() {
    return useContext(UserDataContext);
  }

  // Usage in component:
  function MyComponent() {
    const userData = useUserData();
    
    if (!userData?.success) return null;
    
    return <div>{userData.data.businessSettings?.business_name}</div>;
  }
  */
}

/**
 * Example 5: Refresh data on user action
 */
export async function exampleRefreshOnAction() {
  /*
  function DataTable() {
    const [data, setData] = useState<Customer[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
      setIsRefreshing(true);
      try {
        const response = await userDataService.refreshUserData();
        if (response.success) {
          setData(response.data.customers);
          toast.success('Data refreshed successfully');
        }
      } catch (error) {
        toast.error('Failed to refresh data');
      } finally {
        setIsRefreshing(false);
      }
    };

    return (
      <div>
        <button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <table>
          {data.map(customer => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
            </tr>
          ))}
        </table>
      </div>
    );
  }
  */
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testUserDataService = {
    runAllTests,
    testFetchAllUserData,
    testFetchSpecificData,
    testRefreshUserData,
  };
}
