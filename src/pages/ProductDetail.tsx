/**
 * Product Detail Page - Industry-Grade Implementation
 * Read-only view with edit, delete, and stock management options
 */

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Plus, Minus, MoreVertical, Package } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useInventory, Product } from "@/contexts/InventoryContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import StockTransactionModal from "@/components/StockTransactionModal";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { format: formatCurrency } = useCurrency();
  const { getProduct, deleteProduct, addStockTransaction } = useInventory();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockModalType, setStockModalType] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        setLoading(true);
        try {
          const productData = await getProduct(id);
          if (productData) {
            setProduct(productData);
          } else {
            toast.error('Product not found');
            navigate('/inventory');
          }
        } catch (error) {
          console.error('Error loading product:', error);
          toast.error('Failed to load product');
          navigate('/inventory');
        } finally {
          setLoading(false);
        }
      };

      loadProduct();
    }
  }, [id, getProduct, navigate]);

  const handleEdit = () => {
    navigate(`/inventory/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleting(true);
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      navigate('/inventory');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleStockIn = () => {
    setStockModalType('in');
    setStockModalOpen(true);
  };

  const handleStockOut = () => {
    setStockModalType('out');
    setStockModalOpen(true);
  };

  const handleStockTransaction = async (data: { quantity: number; price: number; note: string }) => {
    if (!id) return;

    await addStockTransaction({
      product_id: id,
      type: stockModalType,
      quantity: data.quantity,
      price: data.price,
      amount: data.quantity * data.price,
      note: data.note,
    });

    // Reload product to get updated quantity and cost price
    const updatedProduct = await getProduct(id);
    if (updatedProduct) {
      setProduct(updatedProduct);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-6 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Product not found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The product you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/inventory')} className="mt-4">
              Back to Inventory
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isLowStock = (product.quantity ?? 0) <= (product.min_stock_level ?? 10);
  const isOutOfStock = (product.quantity ?? 0) === 0;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/inventory')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                <Badge variant={product.product_type === 'Product' ? 'default' : 'secondary'}>
                  {product.product_type}
                </Badge>
                {isOutOfStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                {isLowStock && !isOutOfStock && (
                  <Badge variant="outline" className="border-orange-500 text-orange-500">
                    Low Stock
                  </Badge>
                )}
                {product.is_online && (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Online
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {product.category} {product.sku && `• SKU: ${product.sku}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleEdit} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Basic product details and specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                      <p className="text-base font-semibold mt-1">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-base font-semibold mt-1">{product.product_type}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Selling Price</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {formatCurrency(product.selling_price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.tax_inclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
                      </p>
                    </div>
                    {product.product_type === 'Product' && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Purchase Price</p>
                        <p className="text-base font-semibold mt-1">
                          {formatCurrency(product.cost_price)}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tax Rate</p>
                      <p className="text-base font-semibold mt-1">{product.tax_rate}% GST</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p className="text-base font-semibold mt-1">{product.category}</p>
                    </div>
                  </div>

                  {product.product_type === 'Product' && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                          <p className="text-lg font-bold mt-1">
                            {product.quantity} {product.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Unit</p>
                          <p className="text-base font-semibold mt-1">{product.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Low Stock Alert</p>
                          <p className="text-base font-semibold mt-1">{product.min_stock_level}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {product.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="text-sm mt-1 leading-relaxed">{product.description}</p>
                      </div>
                    </>
                  )}

                  {(product.hsn_code || product.barcode || product.sku) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-3 gap-4">
                        {product.hsn_code && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">HSN/SAC Code</p>
                            <p className="text-base font-mono mt-1">{product.hsn_code}</p>
                          </div>
                        )}
                        {product.barcode && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                            <p className="text-base font-mono mt-1">{product.barcode}</p>
                          </div>
                        )}
                        {product.sku && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">SKU</p>
                            <p className="text-base font-mono mt-1">{product.sku}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {(product.brand_name || product.manufacturer_name || product.mrp_price) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        {product.brand_name && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Brand</p>
                            <p className="text-base font-semibold mt-1">{product.brand_name}</p>
                          </div>
                        )}
                        {product.manufacturer_name && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                            <p className="text-base font-semibold mt-1">{product.manufacturer_name}</p>
                          </div>
                        )}
                        {product.mrp_price && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">MRP</p>
                            <p className="text-base font-semibold mt-1">{formatCurrency(product.mrp_price)}</p>
                          </div>
                        )}
                        {product.warranty_period && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Warranty</p>
                            <p className="text-base font-semibold mt-1">{product.warranty_period}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock Value */}
            {product.product_type === 'Product' && (
              <Card>
                <CardHeader>
                  <CardTitle>Stock Value</CardTitle>
                  <CardDescription>
                    Inventory valuation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stock Value (at cost)</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(product.quantity * product.cost_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stock Value (at selling)</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(product.quantity * product.selling_price)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Image */}
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock Actions */}
            {product.product_type === 'Product' && (
              <Card>
                <CardHeader>
                  <CardTitle>Stock Management</CardTitle>
                  <CardDescription>
                    Update inventory levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={handleStockIn} className="w-full" variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Stock In
                  </Button>
                  <Button onClick={handleStockOut} className="w-full" variant="outline">
                    <Minus className="mr-2 h-4 w-4" />
                    Stock Out
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Online Store</span>
                  <Badge variant={product.is_online ? "default" : "secondary"}>
                    {product.is_online ? 'Visible' : 'Hidden'}
                  </Badge>
                </div>
                {product.product_type === 'Product' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">For Sale</span>
                    <Badge variant={product.not_for_sale ? "secondary" : "default"}>
                      {product.not_for_sale ? 'No' : 'Yes'}
                    </Badge>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(product.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{product.name}</strong> from your inventory.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stock Transaction Modal */}
        <StockTransactionModal
          open={stockModalOpen}
          onClose={() => setStockModalOpen(false)}
          product={product}
          type={stockModalType}
          onSubmit={handleStockTransaction}
        />
      </div>
    </DashboardLayout>
  );
}
