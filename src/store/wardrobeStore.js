/**
 * =============================================================================
 * PocketStylist — Zustand State Store
 * =============================================================================
 * 
 * Global state management using Zustand.
 * Manages clothing items, loading states, and provides actions
 * for CRUD operations that sync with the SQLite database.
 * 
 * This is the single source of truth for wardrobe data in the app.
 */

import { create } from 'zustand';
import {
  getAllClothingItems,
  insertClothingItem,
  deleteClothingItem as dbDeleteItem,
  getCategoryCounts,
} from '../database/database';

/**
 * Main wardrobe store.
 * 
 * State shape:
 *   items: ClothingItem[]  — All clothing items in the wardrobe
 *   isLoading: boolean     — Whether a DB operation is in progress
 *   categoryCounts: Object — Item count per category
 *   selectedCategory: string | null — Active filter in closet view
 */
const useWardrobeStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────
  items: [],
  isLoading: false,
  categoryCounts: { tops: 0, bottoms: 0, footwear: 0, accessories: 0 },
  selectedCategory: null, // null = show all

  // ─── Actions ────────────────────────────────────────────────

  /**
   * Loads all items from the database into state.
   * Called on app initialization and after mutations.
   */
  loadItems: async () => {
    set({ isLoading: true });
    try {
      const items = await getAllClothingItems();
      const counts = await getCategoryCounts();
      set({ items, categoryCounts: counts, isLoading: false });
    } catch (error) {
      console.error('[WardrobeStore] Failed to load items:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Adds a new clothing item to the database and state.
   * @param {Object} item — The item to add (must include all required fields).
   */
  addItem: async (item) => {
    try {
      await insertClothingItem(item);
      // Refresh the full list to stay in sync
      await get().loadItems();
    } catch (error) {
      console.error('[WardrobeStore] Failed to add item:', error);
      throw error;
    }
  },

  /**
   * Deletes a clothing item by ID from the database and state.
   * @param {string} id — The UUID of the item to delete.
   */
  deleteItem: async (id) => {
    try {
      await dbDeleteItem(id);
      await get().loadItems();
    } catch (error) {
      console.error('[WardrobeStore] Failed to delete item:', error);
      throw error;
    }
  },

  /**
   * Sets the active category filter for the closet view.
   * @param {string|null} category — Category ID or null for all.
   */
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  /**
   * Returns items filtered by the currently selected category.
   * If no category is selected, returns all items.
   */
  getFilteredItems: () => {
    const { items, selectedCategory } = get();
    if (!selectedCategory) return items;
    return items.filter((item) => item.category === selectedCategory);
  },
}));

export default useWardrobeStore;
