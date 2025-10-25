/**
 * Stock Transaction Modal - Industry-Grade Implementation
 * Handles Stock In/Out operations with proper validation
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/contexts/InventoryContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StockTransactionModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  type: 'in' | 'out';
  onSubmit: (data: { quantity: number; price: number; note: string }) => Promise<void>;
}

export default function StockTransactionModal({
  open,
  onClose,
  product,
  type,
  onSubmit,
}: StockTransactionModalProps) {
  const { format: formatCurrency } = useCurrency();
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    // Validation
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);

    if (!quantity || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!price || prc < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Check if stock out quantity exceeds available stock
    if (type === 'out' && qty > product.quantity) {
      toast.error(`Cannot remove ${qty} ${product.unit}. Only ${product.quantity} ${product.unit} available.`);
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        quantity: qty,
        price: prc,
        note: note.trim(),
      });

      // Reset form
      setQuantity('');
      setPrice('');
      setNote('');
      
      toast.success(
        type === 'in' 
          ? `Stock In completed! Added ${qty} ${product.unit}`
          : `Stock Out completed! Removed ${qty} ${product.unit}`
      );

      onClose();
    } catch (error) {
      console.error('Stock transaction error:', error);
      toast.error('Failed to process stock transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setQuantity('');
      setPrice('');
      setNote('');
      onClose();
    }
  };

  if (!product) return null;

  const calculatedAmount = (parseFloat(quantity) || 0) * (parseFloat(price) || 0);
  const newStock = type === 'in' 
    ? product.quantity + (parseFloat(quantity) || 0)
    : product.quantity - (parseFloat(quantity) || 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'in' ? 'Stock In' : 'Stock Out'}
          </DialogTitle>
          <DialogDescription>
            {type === 'in' 
              ? 'Add inventory to your stock'
              : 'Remove inventory from your stock'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Product Info */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current Stock: {product.quantity} {product.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Selling Price</p>
                  <p className="font-semibold">{formatCurrency(product.selling_price)}</p>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity ({product.unit}) *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
                disabled={loading}
                autoFocus
              />
              {type === 'out' && quantity && parseFloat(quantity) > product.quantity && (
                <p className="text-sm text-destructive">
                  Insufficient stock! Only {product.quantity} {product.unit} available.
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                {type === 'in' ? 'Purchase Price' : 'Selling Price'} per {product.unit} *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {type === 'in' 
                  ? 'Price at which you purchased this item'
                  : 'Price at which you sold this item'}
              </p>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any remarks or notes..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Calculation Summary */}
            {quantity && price && (
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Amount:</span>
                  <span className="font-semibold">{formatCurrency(calculatedAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New Stock Level:</span>
                  <span className="font-semibold">
                    {newStock >= 0 ? `${newStock.toFixed(2)} ${product.unit}` : 
                      <span className="text-destructive">Invalid</span>
                    }
                  </span>
                </div>
                {type === 'in' && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">New Avg. Cost Price:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        ((product.quantity * product.cost_price) + calculatedAmount) / newStock
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (type === 'out' && parseFloat(quantity) > product.quantity)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {type === 'in' ? 'Add Stock' : 'Remove Stock'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
