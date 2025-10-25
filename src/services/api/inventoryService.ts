/**
 * Inventory Service - Industry-Grade Supabase Integration
 * Handles all inventory and stock transaction operations with real-time sync
 */

import { supabase } from '@/integrations/supabase/client';
import { realtimeSyncService } from '@/services/realtime/realtimeSyncService';

// Database row type (matches Supabase schema exactly)
export interface InventoryRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost_price: number;
  selling_price: number;
  min_stock_level?: number | null;
  supplier?: string | null;
  description?: string | null;
  product_data?: any; // JSONB field for extra data
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  synced_at: string;
  device_id?: string | null;
}

export interface StockTransactionRow {
  id: string;
  user_id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  price: number;
  amount: number;
  note?: string | null;
  timestamp: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  synced_at: string;
  device_id?: string | null;
}

// Application type (what the UI uses)
export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  supplier?: string;
  description?: string;
  // Extra fields stored in product_data JSONB
  product_type?: 'Product' | 'Service';
  hsn_code?: string;
  barcode?: string;
  sku?: string;
  tax_rate?: number;
  image?: string;
  tax_inclusive?: boolean;
  gst_category?: 'exempt' | 'zero_rated' | 'standard' | 'luxury';
  is_online?: boolean;
  not_for_sale?: boolean;
  brand_name?: string;
  manufacturer_name?: string;
  mrp_price?: number;
  warranty_period?: string;
  discount_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  product_id: string;
  user_id: string;
  type: 'in' | 'out';
  quantity: number;
  price: number;
  amount: number;
  note?: string;
  timestamp: string;
}

class InventoryService {
  /**
   * Map database row to application Product
   */
  private mapRowToProduct(row: any): Product {
    const productData = row.product_data || {};
    
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      category: row.category,
      quantity: Number(row.quantity),
      unit: row.unit,
      cost_price: Number(row.cost_price),
      selling_price: Number(row.selling_price),
      min_stock_level: row.min_stock_level ? Number(row.min_stock_level) : 10,
      supplier: row.supplier || undefined,
      description: row.description || undefined,
      // Extract from product_data JSONB
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
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Map application Product to database row
   */
  private mapProductToRow(product: Partial<Product>, userId: string): any {
    // Core fields
    const row: any = {
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      min_stock_level: product.min_stock_level,
      supplier: product.supplier,
      description: product.description,
      user_id: userId,
    };

    // Extra fields go into product_data JSONB
    const productData: any = {};
    
    if (product.product_type) productData.product_type = product.product_type;
    if (product.hsn_code) productData.hsn_code = product.hsn_code;
    if (product.barcode) productData.barcode = product.barcode;
    if (product.sku) productData.sku = product.sku;
    if (product.tax_rate !== undefined) productData.tax_rate = product.tax_rate;
    if (product.image) productData.image = product.image;
    if (product.tax_inclusive !== undefined) productData.tax_inclusive = product.tax_inclusive;
    if (product.gst_category) productData.gst_category = product.gst_category;
    if (product.is_online !== undefined) productData.is_online = product.is_online;
    if (product.not_for_sale !== undefined) productData.not_for_sale = product.not_for_sale;
    if (product.brand_name) productData.brand_name = product.brand_name;
    if (product.manufacturer_name) productData.manufacturer_name = product.manufacturer_name;
    if (product.mrp_price) productData.mrp_price = product.mrp_price;
    if (product.warranty_period) productData.warranty_period = product.warranty_period;
    if (product.discount_percent) productData.discount_percent = product.discount_percent;

    if (Object.keys(productData).length > 0) {
      row.product_data = productData;
    }

    return row;
  }

  /**
   * Get all products for the current user
   */
  async getProducts(): Promise<Product[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return (data || []).map((row: any) => this.mapRowToProduct(row));
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('inventory')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching product:', error);
        throw error;
      }

      return this.mapRowToProduct(data);
    } catch (error) {
      console.error('Error in getProduct:', error);
      return null;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(product: Partial<Product>): Promise<Product> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const id = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const row = this.mapProductToRow(product, user.id);

    const result = await realtimeSyncService.create<InventoryRow>(
      'inventory',
      {
        ...row,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      },
      { optimisticId: id }
    );

    if (result.error || !result.data) {
      console.error('Error creating product:', result.error);
      throw result.error || new Error('Failed to create product');
    }

    return this.mapRowToProduct(result.data);
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const row = this.mapProductToRow(updates, user.id);

    const result = await realtimeSyncService.update<InventoryRow>(
      'inventory',
      id,
      {
        ...row,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      }
    );

    if (result.error || !result.data) {
      console.error('Error updating product:', result.error);
      throw result.error || new Error('Failed to update product');
    }

    return this.mapRowToProduct(result.data);
  }

  /**
   * Soft delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const result = await realtimeSyncService.delete('inventory', id);

    if (result.error) {
      console.error('Error deleting product:', result.error);
      throw result.error;
    }
  }

  /**
   * Get all stock transactions
   */
  async getStockTransactions(): Promise<StockTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('stock_transactions')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching stock transactions:', error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        user_id: row.user_id,
        type: row.type as 'in' | 'out',
        quantity: Number(row.quantity),
        price: Number(row.price),
        amount: Number(row.amount),
        note: row.note || undefined,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      console.error('Error in getStockTransactions:', error);
      return [];
    }
  }

  /**
   * Get stock transactions for a specific product
   */
  async getProductTransactions(productId: string): Promise<StockTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('stock_transactions')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('timestamp', { ascending: false});

      if (error) {
        console.error('Error fetching product transactions:', error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        user_id: row.user_id,
        type: row.type as 'in' | 'out',
        quantity: Number(row.quantity),
        price: Number(row.price),
        amount: Number(row.amount),
        note: row.note || undefined,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      console.error('Error in getProductTransactions:', error);
      return [];
    }
  }

  /**
   * Create a stock transaction and update product quantity
   */
  async createStockTransaction(transaction: Omit<StockTransaction, 'id' | 'user_id' | 'timestamp'>): Promise<StockTransaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create stock transaction using realtime sync service
    const result = await realtimeSyncService.create<StockTransactionRow>(
      'stock_transactions',
      {
        product_id: transaction.product_id,
        type: transaction.type,
        quantity: transaction.quantity,
        price: transaction.price,
        amount: transaction.amount,
        note: transaction.note,
        timestamp: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        deleted_at: null,
        device_id: null,
      } as any,
      { optimisticId: id }
    );

    if (result.error || !result.data) {
      console.error('Error creating stock transaction:', result.error);
      throw result.error || new Error('Failed to create stock transaction');
    }

    // Update product quantity and cost price (for stock in)
    const product = await this.getProduct(transaction.product_id);
    if (product) {
      const newQuantity = transaction.type === 'in'
        ? product.quantity + transaction.quantity
        : product.quantity - transaction.quantity;

      // For Stock In: Calculate weighted average cost price
      let newCostPrice = product.cost_price;
      if (transaction.type === 'in' && newQuantity > 0) {
        const oldStockValue = product.quantity * product.cost_price;
        const newStockValue = transaction.quantity * transaction.price;
        newCostPrice = (oldStockValue + newStockValue) / newQuantity;
      }

      await this.updateProduct(transaction.product_id, {
        quantity: Math.max(0, newQuantity),
        cost_price: newCostPrice,
      });
    }

    const data = result.data;
    return {
      id: data.id,
      product_id: data.product_id,
      user_id: data.user_id,
      type: data.type as 'in' | 'out',
      quantity: Number(data.quantity),
      price: Number(data.price),
      amount: Number(data.amount),
      note: data.note || undefined,
      timestamp: data.timestamp,
    };
  }
}

export const inventoryService = new InventoryService();
