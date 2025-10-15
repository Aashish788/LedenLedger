/**
 * Profiles Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for user profiles with:
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

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  facebook: string | null;
  preferred_language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  preferred_language?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
}

// ============================================================================
// PROFILES SERVICE
// ============================================================================

class ProfilesService {
  private tableName = 'profiles' as const;

  /**
   * Fetch profile for current user
   */
  async fetchProfile(): Promise<{
    data: Profile | null;
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
        // If no profile exists, create default profile
        if (error.code === 'PGRST116') {
          return this.createDefaultProfile();
        }
        console.error('❌ Error fetching profile:', error);
        return { data: null, error };
      }

      console.log('✅ Fetched profile');
      return { data: data as Profile, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchProfile:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Fetch profile by user ID
   */
  async fetchProfileByUserId(userId: string): Promise<{
    data: Profile | null;
    error: any;
  }> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('❌ Error fetching profile by user ID:', error);
        return { data: null, error };
      }

      return { data: data as Profile, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchProfileByUserId:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Create default profile
   */
  private async createDefaultProfile(): Promise<{
    data: Profile | null;
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

      const defaultProfile = {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        phone: user.phone || null,
        date_of_birth: null,
        address: null,
        city: null,
        state: null,
        pincode: null,
        country: null,
        bio: null,
        website: null,
        linkedin: null,
        twitter: null,
        facebook: null,
        preferred_language: 'en',
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        deleted_at: null,
        last_transaction: null,
        amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🚀 Creating default profile:', defaultProfile);

      const result = await realtimeSyncService.create<Profile>(
        this.tableName,
        defaultProfile as any
      );

      if (result.error) {
        console.error('❌ Error creating default profile:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Default profile created');
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in createDefaultProfile:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update profile with real-time sync
   */
  async updateProfile(input: UpdateProfileInput): Promise<{
    data: Profile | null;
    error: any;
  }> {
    try {
      // Get current profile
      const { data: currentProfile, error: fetchError } = await this.fetchProfile();
      
      if (fetchError || !currentProfile) {
        return { data: null, error: fetchError || new Error('Profile not found') };
      }

      const updateData = {
        ...input,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🔄 Updating profile with real-time sync:', updateData);

      const result = await realtimeSyncService.update<Profile>(
        this.tableName,
        currentProfile.id,
        updateData
      );

      if (result.error) {
        console.error('❌ Error updating profile:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Profile updated successfully');
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in updateProfile:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update avatar
   */
  async updateAvatar(avatarUrl: string): Promise<{
    data: Profile | null;
    error: any;
  }> {
    return this.updateProfile({ avatar_url: avatarUrl });
  }

  /**
   * Update notification preferences
   */
  async updateNotifications(
    email: boolean,
    sms: boolean,
    push: boolean
  ): Promise<{
    data: Profile | null;
    error: any;
  }> {
    return this.updateProfile({
      email_notifications: email,
      sms_notifications: sms,
      push_notifications: push,
    });
  }

  /**
   * Update personal information
   */
  async updatePersonalInfo(
    fullName: string,
    phone?: string,
    dateOfBirth?: string
  ): Promise<{
    data: Profile | null;
    error: any;
  }> {
    return this.updateProfile({
      full_name: fullName,
      phone,
      date_of_birth: dateOfBirth,
    });
  }

  /**
   * Update address
   */
  async updateAddress(
    address: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  ): Promise<{
    data: Profile | null;
    error: any;
  }> {
    return this.updateProfile({
      address,
      city,
      state,
      pincode,
      country,
    });
  }

  /**
   * Update social links
   */
  async updateSocialLinks(
    linkedin?: string,
    twitter?: string,
    facebook?: string,
    website?: string
  ): Promise<{
    data: Profile | null;
    error: any;
  }> {
    return this.updateProfile({
      linkedin,
      twitter,
      facebook,
      website,
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const profilesService = new ProfilesService();
