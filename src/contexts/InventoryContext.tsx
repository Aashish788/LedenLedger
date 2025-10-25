/**
 * Inventory Context - Industry-Grade State Management
 * Manages products, services, and stock transactions with Supabase integration
 */

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { inventoryService, Product, StockTransaction } from '@/services/api/inventoryService';
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
  }, []);

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
