/**
 * User Data Dashboard Example
 * 
 * This component demonstrates how to use the userDataService
 * to fetch all user data in a production-safe manner with proper user isolation.
 * 
 * @example
 * import { UserDataDashboard } from './components/UserDataDashboard';
 * 
 * function App() {
 *   return <UserDataDashboard />;
 * }
 */

import React, { useEffect, useState } from 'react';
import { userDataService, type UserDataResponse } from '@/services/api/userDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export function UserDataDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<UserDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  /**
   * Fetch all user data
   */
  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userDataService.fetchAllUserData();

      if (response.success && response.data) {
        setData(response.data);
        setLastFetchTime(new Date());
        console.log('✅ User data fetched successfully:', response.data.stats);
      } else {
        setError(response.error || 'Failed to fetch user data');
        console.error('❌ Failed to fetch user data:', response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Exception during data fetch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load data on component mount
   */
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Data Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive view of all user data with proper isolation
          </p>
        </div>
        <Button 
          onClick={fetchUserData} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      {/* Last Fetch Time */}
      {lastFetchTime && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Last updated: {lastFetchTime.toLocaleString()}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Data Display */}
      {data && (
        <>
          {/* Profile & Business Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.profile ? (
                  <>
                    <div>
                      <span className="font-medium">Name:</span>{' '}
                      {data.profile.full_name || 'Not set'}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {data.profile.phone || 'Not set'}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>{' '}
                      <code className="text-xs">{data.profile.id}</code>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No profile data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.businessSettings ? (
                  <>
                    <div>
                      <span className="font-medium">Business Name:</span>{' '}
                      {data.businessSettings.business_name}
                    </div>
                    <div>
                      <span className="font-medium">Owner:</span>{' '}
                      {data.businessSettings.owner_name || 'Not set'}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>{' '}
                      {data.businessSettings.business_type}
                    </div>
                    <div>
                      <span className="font-medium">Currency:</span>{' '}
                      {data.businessSettings.currency}
                    </div>
                    <div>
                      <span className="font-medium">GST Registered:</span>{' '}
                      <Badge variant={data.businessSettings.is_gst_registered ? 'default' : 'secondary'}>
                        {data.businessSettings.is_gst_registered ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No business settings</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics Grid */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatsCard
              title="Customers"
              value={data.stats.totalCustomers}
              description="Total customers"
            />
            <StatsCard
              title="Suppliers"
              value={data.stats.totalSuppliers}
              description="Total suppliers"
            />
            <StatsCard
              title="Invoices"
              value={data.stats.totalInvoices}
              description="Total invoices"
            />
            <StatsCard
              title="Cash Book"
              value={data.stats.totalCashBookEntries}
              description="Total entries"
            />
            <StatsCard
              title="Staff"
              value={data.stats.totalStaff}
              description="Active staff"
            />
            <StatsCard
              title="Transactions"
              value={data.stats.totalTransactions}
              description="Total transactions"
            />
          </div>

          {/* Detailed Data Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customers List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Customers</CardTitle>
                <CardDescription>
                  Latest {Math.min(5, data.customers.length)} customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.customers.length > 0 ? (
                  <ul className="space-y-2">
                    {data.customers.slice(0, 5).map((customer) => (
                      <li key={customer.id} className="flex justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {customer.amount >= 0 ? '+' : ''}{customer.amount}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No customers yet</p>
                )}
              </CardContent>
            </Card>

            {/* Suppliers List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Suppliers</CardTitle>
                <CardDescription>
                  Latest {Math.min(5, data.suppliers.length)} suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.suppliers.length > 0 ? (
                  <ul className="space-y-2">
                    {data.suppliers.slice(0, 5).map((supplier) => (
                      <li key={supplier.id} className="flex justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground">{supplier.phone}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {supplier.amount >= 0 ? '+' : ''}{supplier.amount}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No suppliers yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Latest {Math.min(5, data.invoices.length)} invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.invoices.length > 0 ? (
                  <ul className="space-y-2">
                    {data.invoices.slice(0, 5).map((invoice) => (
                      <li key={invoice.id} className="flex justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">#{invoice.bill_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{invoice.total}</div>
                          <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No invoices yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Cash Book Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Cash Book Entries</CardTitle>
                <CardDescription>
                  Latest {Math.min(5, data.cashBookEntries.length)} entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.cashBookEntries.length > 0 ? (
                  <ul className="space-y-2">
                    {data.cashBookEntries.slice(0, 5).map((entry) => (
                      <li key={entry.id} className="flex justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">
                            {entry.type === 'in' ? '↑ IN' : '↓ OUT'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.note || 'No description'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${entry.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.type === 'in' ? '+' : '-'}{entry.amount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.payment_mode || 'N/A'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No entries yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Staff Section */}
          {data.staff.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>All active staff members</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.staff.map((member) => (
                    <li key={member.id} className="flex justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.position} • {member.phone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{member.monthly_salary}</div>
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Stats Card Component
 */
function StatsCard({ 
  title, 
  value, 
  description 
}: { 
  title: string; 
  value: number; 
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Get badge variant based on invoice status
 */
function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case 'paid':
      return 'default';
    case 'sent':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    case 'draft':
      return 'outline';
    default:
      return 'secondary';
  }
}
