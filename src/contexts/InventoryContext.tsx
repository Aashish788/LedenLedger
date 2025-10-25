/**
 * Inventory Context - Industry-Grade State Management
 * Manages products, services, and stock transactions with Supabase real-time sync
 */

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { inventoryService, Product, StockTransaction } from '@/services/api/inventoryService';
import { realtimeSyncService } from '@/services/realtime/realtimeSyncService';
import { toast } from 'sonner';

interface InventoryContextType {
  products: Product[];
  transactions: StockTransaction[];
  loading: boolean;
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  getProductsByCategory: (category: string) => Product[];
  refreshProducts: () => Promise<void>;
  addStockTransaction: (transaction: Omit<StockTransaction, 'id' | 'user_id' | 'timestamp'>) => Promise<void>;
  getProductTransactions: (productId: string) => StockTransaction[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();

    // Subscribe to real-time inventory changes
    const unsubscribeInventory = realtimeSyncService.subscribe({
      table: 'inventory',
      onInsert: (payload) => {
        console.log('📦 Inventory INSERT:', payload.new);
        const newProduct = mapPayloadToProduct(payload.new);
        if (newProduct) {
          setProducts(prev => {
            // Avoid duplicates
            if (prev.find(p => p.id === newProduct.id)) return prev;
            return [newProduct, ...prev];
          });
        }
      },
      onUpdate: (payload) => {
        console.log('📦 Inventory UPDATE:', payload.new);
        const updatedProduct = mapPayloadToProduct(payload.new);
        if (updatedProduct) {
          setProducts(prev => 
            prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
          );
        }
      },
      onDelete: (payload) => {
        console.log('📦 Inventory DELETE:', payload.old);
        const deletedId = (payload.old as any)?.id;
        if (deletedId) {
          setProducts(prev => prev.filter(p => p.id !== deletedId));
        }
      },
    });

    // Subscribe to stock transactions changes
    const unsubscribeTransactions = realtimeSyncService.subscribe({
      table: 'stock_transactions',
      onInsert: (payload) => {
        console.log('📊 Stock Transaction INSERT:', payload.new);
        const newTransaction = mapPayloadToTransaction(payload.new);
        if (newTransaction) {
          setTransactions(prev => {
            // Avoid duplicates
            if (prev.find(t => t.id === newTransaction.id)) return prev;
            return [newTransaction, ...prev];
          });
          // Refresh products to update quantities
          refreshProducts();
        }
      },
    });

    return () => {
      unsubscribeInventory();
      unsubscribeTransactions();
    };
  }, []);

  // Helper function to map database payload to Product
  const mapPayloadToProduct = (payload: any): Product | null => {
    if (!payload || payload.deleted_at) return null;
    
    const productData = payload.product_data || {};
    
    return {
      id: payload.id,
      user_id: payload.user_id,
      name: payload.name,
      category: payload.category,
      quantity: Number(payload.quantity),
      unit: payload.unit,
      cost_price: Number(payload.cost_price),
      selling_price: Number(payload.selling_price),
      min_stock_level: payload.min_stock_level ? Number(payload.min_stock_level) : 10,
      supplier: payload.supplier || undefined,
      description: payload.description || undefined,
      product_type: productData.product_type || 'Product',
      hsn_code: productData.hsn_code,
      barcode: productData.barcode,
      sku: productData.sku,
      tax_rate: productData.tax_rate,
      image: productData.image,
      tax_inclusive: productData.tax_inclusive,
      gst_category: productData.gst_category,
      is_online: productData.is_online,
      not_for_sale: productData.not_for_sale,
      brand_name: productData.brand_name,
      manufacturer_name: productData.manufacturer_name,
      mrp_price: productData.mrp_price,
      warranty_period: productData.warranty_period,
      discount_percent: productData.discount_percent,
      created_at: payload.created_at,
      updated_at: payload.updated_at,
    };
  };

  // Helper function to map database payload to StockTransaction
  const mapPayloadToTransaction = (payload: any): StockTransaction | null => {
    if (!payload || payload.deleted_at) return null;
    
    return {
      id: payload.id,
      product_id: payload.product_id,
      user_id: payload.user_id,
      type: payload.type as 'in' | 'out',
      quantity: Number(payload.quantity),
      price: Number(payload.price),
      amount: Number(payload.amount),
      note: payload.note || undefined,
      timestamp: payload.timestamp,
    };
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [productsData, transactionsData] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getStockTransactions(),
      ]);
      setProducts(productsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Partial<Product>) => {
    try {
      const newProduct = await inventoryService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Product added successfully');
      await refreshProducts(); // Refresh to ensure sync
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await inventoryService.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await inventoryService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  };

  const getProduct = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const searchProducts = (query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku?.toLowerCase().includes(lowerQuery) ||
      p.barcode?.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  };

  const getProductsByCategory = (category: string): Product[] => {
    if (category === 'all') return products;
    return products.filter(p => p.category === category);
  };

  const refreshProducts = async () => {
    await loadInventory();
  };

  const addStockTransaction = async (transactionData: Omit<StockTransaction, 'id' | 'user_id' | 'timestamp'>) => {
    try {
      const newTransaction = await inventoryService.createStockTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      // Refresh products to get updated quantities
      await refreshProducts();
      toast.success(`Stock ${transactionData.type === 'in' ? 'added' : 'removed'} successfully`);
    } catch (error) {
      console.error('Error adding stock transaction:', error);
      toast.error('Failed to add stock transaction');
      throw error;
    }
  };

  const getProductTransactions = (productId: string): StockTransaction[] => {
    return transactions.filter(t => t.product_id === productId);
  };

  const value: InventoryContextType = {
    products,
    transactions,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    searchProducts,
    getProductsByCategory,
    refreshProducts,
    addStockTransaction,
    getProductTransactions,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// Re-export types for convenience
export type { Product, StockTransaction };
