import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

/**
 * Main wardrobe store connected to Supabase.
 */
const useWardrobeStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────
  items: [],
  isLoading: false,
  categoryCounts: { tops: 0, bottoms: 0, footwear: 0, accessories: 0 },
  selectedCategory: null, // null = show all

  // ─── Actions ────────────────────────────────────────────────

  loadItems: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: items, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate category counts dynamically
      const counts = { tops: 0, bottoms: 0, footwear: 0, accessories: 0 };
      items.forEach(item => {
        if (item.category === 'topwear') counts.tops++;
        else if (item.category === 'bottomwear') counts.bottoms++;
        else if (item.category === 'footwear') counts.footwear++;
        else if (item.category === 'accessory') counts.accessories++;
      });

      set({ items, categoryCounts: counts, isLoading: false });
    } catch (error) {
      console.error('[WardrobeStore] Failed to load items:', error);
      set({ isLoading: false });
    }
  },

  deleteItem: async (id) => {
    try {
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().loadItems();
    } catch (error) {
      console.error('[WardrobeStore] Failed to delete item:', error);
      throw error;
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  getFilteredItems: () => {
    const { items, selectedCategory } = get();
    if (!selectedCategory) return items;
    // Map internal categories to Supabase schema categories if needed
    let filterCategory = selectedCategory;
    if (selectedCategory === 'tops') filterCategory = 'topwear';
    if (selectedCategory === 'bottoms') filterCategory = 'bottomwear';
    if (selectedCategory === 'accessories') filterCategory = 'accessory';
    
    return items.filter((item) => item.category === filterCategory);
  },
}));

export default useWardrobeStore;
