/**
 * Product Selection Modal - Industry-Grade Implementation
 * Select products from inventory to add to invoice items
 * Built with decades of expertise in inventory management systems
 */

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Package, 
  ShoppingCart, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Filter,
  Loader2
} from "lucide-react";
import { useInventory, Product } from "@/contexts/InventoryContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProductSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProducts: (products: SelectedProduct[]) => void;
}

export interface SelectedProduct {
  id: string;
  name: string;
  description?: string;
  hsn?: string;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
  availableStock: number;
}

export default function ProductSelectionModal({ 
  open, 
  onOpenChange, 
  onSelectProducts 
}: ProductSelectionModalProps) {
  const { products, loading } = useInventory();
  const { format: formatCurrency } = useCurrency();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<Map<string, SelectedProduct>>(new Map());
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setCategoryFilter("all");
      setSelectedProducts(new Map());
      setQuantities(new Map());
    }
  }, [open]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Only show products that are for sale
      if (product.not_for_sale) return false;
      
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery, categoryFilter]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    const qty = Math.max(1, quantity);
    setQuantities(prev => new Map(prev).set(productId, qty));
  };

  const handleToggleProduct = (product: Product) => {
    const newSelected = new Map(selectedProducts);
    
    if (newSelected.has(product.id)) {
      // Remove from selection
      newSelected.delete(product.id);
      setQuantities(prev => {
        const newQty = new Map(prev);
        newQty.delete(product.id);
        return newQty;
      });
    } else {
      // Add to selection with default quantity
      const quantity = quantities.get(product.id) || 1;
      const discount = product.discount_percent || 0;
      const price = product.selling_price;
      const amount = quantity * price * (1 - discount / 100);
      
      newSelected.set(product.id, {
        id: product.id,
        name: product.name,
        description: product.description,
        hsn: product.hsn_code,
        quantity,
        price,
        discount,
        amount,
        availableStock: product.quantity
      });
      
      if (!quantities.has(product.id)) {
        setQuantities(prev => new Map(prev).set(product.id, 1));
      }
    }
    
    setSelectedProducts(newSelected);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    handleQuantityChange(productId, quantity);
    
    // Update selected product if already selected
    if (selectedProducts.has(productId)) {
      const newSelected = new Map(selectedProducts);
      const product = newSelected.get(productId)!;
      const amount = quantity * product.price * (1 - product.discount / 100);
      
      newSelected.set(productId, {
        ...product,
        quantity,
        amount
      });
      
      setSelectedProducts(newSelected);
    }
  };

  const handleAddToInvoice = () => {
    const productsArray = Array.from(selectedProducts.values());
    
    if (productsArray.length === 0) {
      return;
    }
    
    onSelectProducts(productsArray);
    onOpenChange(false);
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) {
      return { text: "Out of Stock", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950" };
    } else if (quantity <= minStock) {
      return { text: "Low Stock", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950" };
    } else {
      return { text: "In Stock", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950" };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Products from Inventory
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choose products to add to your invoice
              </p>
            </div>
            {selectedProducts.size > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {selectedProducts.size} selected
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] h-9">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products List */}
        <ScrollArea className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">No products found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Add products to inventory first'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.has(product.id);
                const quantity = quantities.get(product.id) || 1;
                const stockStatus = getStockStatus(product.quantity, product.min_stock_level);
                const isOutOfStock = product.quantity === 0;

                return (
                  <div
                    key={product.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all cursor-pointer",
                      isSelected 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                      isOutOfStock && "opacity-60"
                    )}
                    onClick={() => !isOutOfStock && handleToggleProduct(product)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <div className={cn(
                          "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                          isSelected 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground/30",
                          isOutOfStock && "cursor-not-allowed"
                        )}>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                            {product.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {product.category}
                              </Badge>
                              {product.sku && (
                                <span className="text-[10px] text-muted-foreground">
                                  SKU: {product.sku}
                                </span>
                              )}
                              {product.hsn_code && (
                                <span className="text-[10px] text-muted-foreground">
                                  HSN: {product.hsn_code}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              {formatCurrency(product.selling_price)}
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-[10px] px-1.5 py-0 mt-1", stockStatus.bgColor, stockStatus.color)}
                            >
                              {stockStatus.text} ({product.quantity} {product.unit})
                            </Badge>
                          </div>
                        </div>

                        {/* Quantity Input - Show when selected */}
                        {isSelected && (
                          <div className="mt-3 flex items-center gap-2">
                            <Label className="text-xs font-medium min-w-[60px]">Quantity:</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateQuantity(product.id, quantity - 1);
                                }}
                                disabled={quantity <= 1}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={product.quantity}
                                value={quantity}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleUpdateQuantity(product.id, parseInt(e.target.value) || 1);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-7 w-16 text-center text-sm"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateQuantity(product.id, quantity + 1);
                                }}
                                disabled={quantity >= product.quantity}
                              >
                                +
                              </Button>
                              <span className="text-xs text-muted-foreground ml-2">
                                Total: {formatCurrency(quantity * product.selling_price)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Out of stock warning */}
                        {isOutOfStock && (
                          <div className="mt-2 flex items-center gap-1.5 text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Product is out of stock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </span>
            {selectedProducts.size > 0 && (
              <span className="ml-4 font-medium">
                • {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddToInvoice}
              disabled={selectedProducts.size === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Invoice ({selectedProducts.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Missing Label import
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
