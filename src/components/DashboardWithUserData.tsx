/**
 * Dashboard Integration Example
 * 
 * This file shows how to integrate the userDataService into your Dashboard component
 */

import React, { useEffect, useState } from 'react';
import { userDataService, type UserDataResponse } from '@/services/api/userDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getGreetingWithName } from '@/utils/greetings';
import { AnimatedGreeting } from '@/components/AnimatedGreeting';
import { 
  Users, 
  Building2, 
  FileText, 
  Wallet, 
  UserCheck,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export function DashboardWithUserData() {
  const [userData, setUserData] = useState<UserDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading user data...');
      const response = await userDataService.fetchAllUserData();
      
      if (response.success) {
        setUserData(response);
        console.log('✅ User data loaded successfully');
        console.log('📈 Counts:', response.metadata.counts);
      } else {
        console.error('❌ Failed to load user data:', response.error);
        toast.error('Failed to load data: ' + response.error);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      toast.error('An error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await userDataService.refreshUserData();
      if (response.success) {
        setUserData(response);
        toast.success('Data refreshed successfully');
      } else {
        toast.error('Failed to refresh data');
      }
    } catch (error) {
      toast.error('Error refreshing data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!userData?.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error Loading Data
            </CardTitle>
            <CardDescription>{userData?.error || 'Unknown error occurred'}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={loadUserData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data, metadata } = userData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <AnimatedGreeting 
            text={getGreetingWithName(data.businessSettings?.owner_name || '')}
            className="text-3xl font-bold"
            typingSpeed={38}
            showCursor={true}
          />
          <p className="text-gray-600 mt-1">
            {data.businessSettings?.business_name || 'My Business'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Customers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.counts.customers}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total customer accounts
            </p>
          </CardContent>
        </Card>

        {/* Suppliers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.counts.suppliers}</div>
            <p className="text-xs text-gray-600 mt-1">
              Active suppliers
            </p>
          </CardContent>
        </Card>

        {/* Invoices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.counts.invoices}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total invoices generated
            </p>
          </CardContent>
        </Card>

        {/* Cash Book Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Book</CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.counts.cashBook}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total cash entries
            </p>
          </CardContent>
        </Card>

        {/* Staff Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.counts.staff}</div>
            <p className="text-xs text-gray-600 mt-1">
              Active employees
            </p>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.counts.transactions}</div>
            <p className="text-xs text-gray-600 mt-1">
              Payment transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Settings Summary */}
      {data.businessSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your business profile and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Business Type</p>
                <p className="font-medium">{data.businessSettings.business_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="font-medium">{data.businessSettings.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">GST Registered</p>
                <p className="font-medium">
                  {data.businessSettings.is_gst_registered ? 'Yes' : 'No'}
                </p>
              </div>
              {data.businessSettings.gst_number && (
                <div>
                  <p className="text-sm text-gray-600">GST Number</p>
                  <p className="font-medium">{data.businessSettings.gst_number}</p>
                </div>
              )}
              {data.businessSettings.phone_number && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{data.businessSettings.phone_number}</p>
                </div>
              )}
              {data.businessSettings.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{data.businessSettings.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity (example using actual data) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Your latest customer additions</CardDescription>
        </CardHeader>
        <CardContent>
          {data.customers.length > 0 ? (
            <div className="space-y-2">
              {data.customers.slice(0, 5).map((customer) => (
                <div 
                  key={customer.id} 
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {data.businessSettings?.currency} {customer.amount?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-600">Balance</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No customers yet</p>
          )}
        </CardContent>
      </Card>

      {/* Data Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Data Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Last Fetched</p>
              <p className="font-medium">
                {new Date(metadata.fetchedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">User ID</p>
              <p className="font-mono text-xs">{metadata.userId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardWithUserData;
