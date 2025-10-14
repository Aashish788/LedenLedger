/**
 * Business Profile Context
 * Provides company/business information throughout the app
 * Syncs with Supabase business_settings table for persistent storage
 * 
 * @module BusinessContext
 * @description Industry-level implementation with proper error handling,
 * type safety, and Supabase integration using the correct table.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type BusinessType = 
  | 'Retailer / Shop'
  | 'Wholesaler'
  | 'Manufacturer'
  | 'Service Provider'
  | 'Restaurant / Cafe'
  | 'Other';

export interface BusinessProfile {
  id?: string;
  ownerName: string;
  businessName: string;
  businessType: BusinessType;
  gstNumber?: string;
  country: string;
  currency: string;
  phone: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BusinessContextType {
  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => Promise<boolean>;
  saveBusinessProfile: () => Promise<boolean>;
  isLoaded: boolean;
  isLoading: boolean;
}

const defaultBusinessProfile: BusinessProfile = {
  ownerName: '',
  businessName: 'My Company',
  businessType: 'Retailer / Shop',
  gstNumber: '',
  country: 'India',
  currency: 'INR',
  phone: '',
  email: '',
  website: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEY = 'business_profile';

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load business profile from Supabase on mount
  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    setIsLoading(true);
    
    try {
      // Get authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.warn('[BusinessContext] No authenticated user, loading defaults');
        setBusinessProfile(defaultBusinessProfile);
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // Fetch from correct table: business_settings (not business_profiles)
      const { data, error } = await (supabase as any)
        .from('business_settings') // ✅ Fixed: Use correct table name
        .select('*')
        .eq('user_id', userId) // ✅ Fixed: Add user_id filter for RLS
        .maybeSingle();

      if (error) {
        console.error('[BusinessContext] Supabase fetch error:', error);
        throw error;
      }

      if (data) {
        const profile: BusinessProfile = {
          id: data.id,
          ownerName: data.owner_name || '',
          businessName: data.business_name || 'My Company',
          businessType: data.business_type || 'Retailer / Shop',
          gstNumber: data.gst_number || '',
          country: data.country || 'India',
          currency: data.currency || 'INR',
          phone: data.phone_number || '', // ✅ Fixed: Use phone_number from DB
          email: data.email || '',
          website: data.website || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          // Note: logo field removed - not in business_settings table
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setBusinessProfile(profile);
        
        // Save to localStorage for offline access
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } else {
        // No settings yet - use defaults
        setBusinessProfile(defaultBusinessProfile);
      }
    } catch (error) {
      console.error('[BusinessContext] Error loading business profile:', error);
      
      // Fallback to localStorage as last resort
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setBusinessProfile({ ...defaultBusinessProfile, ...parsed });
        } else {
          setBusinessProfile(defaultBusinessProfile);
        }
      } catch (localError) {
        console.error('[BusinessContext] localStorage fallback failed:', localError);
        setBusinessProfile(defaultBusinessProfile);
      }
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  const updateBusinessProfile = async (updates: Partial<BusinessProfile>): Promise<boolean> => {
    const updated = { ...businessProfile, ...updates };
    
    // Optimistic update - update UI immediately
    setBusinessProfile(updated);
    
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Sync with Supabase
    try {
      // Get authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.warn('[BusinessContext] No authenticated user for update');
        toast.error('Please log in to save settings');
        return false;
      }

      const userId = session.user.id;

      if (businessProfile.id) {
        // Update existing settings
        const { error } = await (supabase as any)
          .from('business_settings') // ✅ Fixed: Use correct table name
          .update({
            owner_name: updated.ownerName,
            business_name: updated.businessName,
            business_type: updated.businessType,
            gst_number: updated.gstNumber,
            country: updated.country,
            currency: updated.currency,
            phone_number: updated.phone, // ✅ Fixed: Use phone_number field
            email: updated.email,
            website: updated.website,
            address: updated.address,
            city: updated.city,
            state: updated.state,
            pincode: updated.pincode,
            // logo field removed - not in business_settings table
            updated_at: new Date().toISOString(),
          })
          .eq('id', businessProfile.id)
          .eq('user_id', userId); // ✅ Added: Extra security check

        if (error) {
          console.error('[BusinessContext] Update error:', error);
          throw error;
        }
        
        toast.success('Business settings updated');
      } else {
        // Create new settings
        const { data, error } = await (supabase as any)
          .from('business_settings') // ✅ Fixed: Use correct table name
          .insert({
            user_id: userId, // ✅ Fixed: Add user_id for RLS
            owner_name: updated.ownerName,
            business_name: updated.businessName,
            business_type: updated.businessType,
            gst_number: updated.gstNumber,
            country: updated.country,
            currency: updated.currency,
            phone_number: updated.phone, // ✅ Fixed: Use phone_number field
            email: updated.email,
            website: updated.website,
            address: updated.address,
            city: updated.city,
            state: updated.state,
            pincode: updated.pincode,
            // logo field removed - not in business_settings table
          })
          .select()
          .single();

        if (error) {
          console.error('[BusinessContext] Insert error:', error);
          throw error;
        }
        
        if (data) {
          const updatedWithId = { ...updated, id: data.id };
          setBusinessProfile(updatedWithId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWithId));
          toast.success('Business settings saved');
        }
      }
      
      return true;
    } catch (error) {
      console.error('[BusinessContext] Error syncing with Supabase:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save: ${errorMessage}`);
      
      // Return false to indicate sync failed (but local update succeeded)
      return false;
    }
  };

  const saveBusinessProfile = async (): Promise<boolean> => {
    return updateBusinessProfile({});
  };

  return (
    <BusinessContext.Provider 
      value={{ 
        businessProfile, 
        updateBusinessProfile, 
        saveBusinessProfile,
        isLoaded,
        isLoading,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
}

