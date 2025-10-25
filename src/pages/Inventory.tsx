/**
 * Inventory Management Page - Industry-Grade Implementation
 * Complete product/service management with stock tracking
 */

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, AlertTriangle, CheckCircle, BarChart3, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventory, Product } from "@/contexts/InventoryContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
  const navigate = useNavigate();
  const { format: formatCurrency } = useCurrency();
  const { products, loading } = useInventory();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);
    const lowStockItems = products.filter(p => p.quantity <= p.min_stock_level).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;

    return { totalItems, totalValue, lowStockItems, outOfStock };
  }, [products]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock_low':
          return a.quantity - b.quantity;
        case 'stock_high':
          return b.quantity - a.quantity;
        case 'price_low':
          return a.selling_price - b.selling_price;
        case 'price_high':
          return b.selling_price - a.selling_price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, categoryFilter, sortBy]);

  const handleProductClick = (product: Product) => {
    navigate(`/inventory/${product.id}`);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Manage your products and services
            </p>
          </div>
          <Button onClick={() => navigate('/inventory/new')} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Products & Services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total stock value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items need restock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items unavailable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="stock_low">Stock Low-High</SelectItem>
                  <SelectItem value="stock_high">Stock High-Low</SelectItem>
                  <SelectItem value="price_low">Price Low-High</SelectItem>
                  <SelectItem value="price_high">Price High-Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
            </CardTitle>
            <CardDescription>
              {categoryFilter === 'all' ? 'All products and services' : `Category: ${categoryFilter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Try a different search term" : "Add your first product to get started"}
                </p>
                <Button 
                  onClick={() => navigate('/inventory/new')} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 py-4 hover:bg-accent/50 px-4 -mx-4 rounded-lg transition-colors cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Product Image/Icon */}
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold truncate">{product.name}</h4>
                        <Badge variant={product.product_type === 'Product' ? 'default' : 'secondary'} className="text-xs">
                          {product.product_type}
                        </Badge>
                        {product.quantity <= product.min_stock_level && (
                          <Badge variant={product.quantity === 0 ? 'destructive' : 'outline'} className="text-xs">
                            {product.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.sku && `SKU: ${product.sku} • `}
                        {product.category}
                      </p>
                    </div>

                    {/* Stock Info */}
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(product.selling_price)}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.quantity.toFixed(2)} {product.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
