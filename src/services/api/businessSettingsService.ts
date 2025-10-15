/**
 * Business Settings Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for business settings with:
 * - Real-time bidirectional sync
 * - Optimistic updates
 * - Offline support
 * - Full type safety
 * 
 * @version 2.0.0
 * @author Senior Backend Engineer
 */

import { realtimeSyncService } from '@/services/realtime/realtimeSyncService';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BusinessSettings {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  industry: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  currency: string;
  timezone: string;
  date_format: string;
  fiscal_year_start: string | null;
  invoice_prefix: string | null;
  invoice_number_start: number;
  terms_and_conditions: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  upi_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

export interface UpdateBusinessSettingsInput {
  business_name?: string;
  business_type?: string;
  industry?: string;
  gst_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  currency?: string;
  timezone?: string;
  date_format?: string;
  fiscal_year_start?: string;
  invoice_prefix?: string;
  invoice_number_start?: number;
  terms_and_conditions?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  upi_id?: string;
}

// ============================================================================
// BUSINESS SETTINGS SERVICE
// ============================================================================

class BusinessSettingsService {
  private tableName = 'business_settings' as const;

  /**
   * Fetch business settings for current user
   */
  async fetchBusinessSettings(): Promise<{
    data: BusinessSettings | null;
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
        };
      }

      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) {
        // If no settings exist, create default settings
        if (error.code === 'PGRST116') {
          return this.createDefaultSettings();
        }
        console.error('❌ Error fetching business settings:', error);
        return { data: null, error };
      }

      console.log('✅ Fetched business settings');
      return { data: data as BusinessSettings, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchBusinessSettings:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Create default business settings
   */
  private async createDefaultSettings(): Promise<{
    data: BusinessSettings | null;
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
        };
      }

      const defaultSettings = {
        user_id: user.id,
        business_name: 'My Business',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        date_format: 'DD/MM/YYYY',
        invoice_number_start: 1,
        invoice_prefix: 'INV',
        business_type: null,
        industry: null,
        gst_number: null,
        pan_number: null,
        address: null,
        city: null,
        state: null,
        pincode: null,
        phone: null,
        email: null,
        website: null,
        logo_url: null,
        fiscal_year_start: null,
        terms_and_conditions: null,
        bank_name: null,
        bank_account_number: null,
        bank_ifsc: null,
        upi_id: null,
        deleted_at: null,
        last_transaction: null,
        amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🚀 Creating default business settings:', defaultSettings);

      const result = await realtimeSyncService.create<BusinessSettings>(
        this.tableName,
        defaultSettings as any
      );

      if (result.error) {
        console.error('❌ Error creating default settings:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Default business settings created');
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in createDefaultSettings:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update business settings with real-time sync
   */
  async updateBusinessSettings(input: UpdateBusinessSettingsInput): Promise<{
    data: BusinessSettings | null;
    error: any;
  }> {
    try {
      // Get current settings
      const { data: currentSettings, error: fetchError } = await this.fetchBusinessSettings();
      
      if (fetchError || !currentSettings) {
        return { data: null, error: fetchError || new Error('Settings not found') };
      }

      const updateData = {
        ...input,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🔄 Updating business settings with real-time sync:', updateData);

      const result = await realtimeSyncService.update<BusinessSettings>(
        this.tableName,
        currentSettings.id,
        updateData
      );

      if (result.error) {
        console.error('❌ Error updating business settings:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Business settings updated successfully');
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in updateBusinessSettings:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update logo URL
   */
  async updateLogo(logoUrl: string): Promise<{
    data: BusinessSettings | null;
    error: any;
  }> {
    return this.updateBusinessSettings({ logo_url: logoUrl });
  }

  /**
   * Update invoice settings
   */
  async updateInvoiceSettings(prefix: string, startNumber: number): Promise<{
    data: BusinessSettings | null;
    error: any;
  }> {
    return this.updateBusinessSettings({
      invoice_prefix: prefix,
      invoice_number_start: startNumber,
    });
  }

  /**
   * Update bank details
   */
  async updateBankDetails(
    bankName: string,
    accountNumber: string,
    ifsc: string,
    upiId?: string
  ): Promise<{
    data: BusinessSettings | null;
    error: any;
  }> {
    return this.updateBusinessSettings({
      bank_name: bankName,
      bank_account_number: accountNumber,
      bank_ifsc: ifsc,
      upi_id: upiId,
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const businessSettingsService = new BusinessSettingsService();
