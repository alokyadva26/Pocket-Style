import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

export const useUserStore = create((set, get) => ({
  profile: null,
  loading: true,
  error: null,

  fetchProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      set({ profile: data || null, loading: false });
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (userId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date() })
        .select()
        .single();

      if (error) throw error;
      
      set({ profile: data, loading: false });
      return data;
    } catch (error) {
      console.error('Error updating profile:', error.message);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearProfile: () => set({ profile: null, loading: false, error: null }),
}));
