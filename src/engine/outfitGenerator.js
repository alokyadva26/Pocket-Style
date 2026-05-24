import { supabase } from '../../lib/supabase';
import useWardrobeStore from '../store/wardrobeStore';

/**
 * Calls the AI Smart Stylist Edge Function to generate an outfit.
 * 
 * @param {string} occasion — The occasion to generate for (e.g., 'casual', 'formal').
 * @param {string} weather — The weather context (e.g., 'sunny', 'chilly').
 * @returns {Object} Result object.
 */
export async function generateOutfit(occasion, weather = 'sunny') {
  try {
    const { data, error } = await supabase.functions.invoke('generate-outfit', {
      body: { occasion, weather },
    });

    if (error) {
      throw error;
    }

    if (!data.success) {
      return {
        success: false,
        outfit: null,
        message: data.message || 'AI failed to generate an outfit.',
      };
    }

    // Enrich the outfit items with full frontend wardrobe store data (which includes image_url / imagePath)
    const storeItems = useWardrobeStore.getState().items || [];
    const findAndMerge = (item) => {
      if (!item) return null;
      const matched = storeItems.find(i => i.id === item.id);
      return matched ? { ...item, ...matched } : item;
    };

    const enrichedOutfit = {
      ...data.outfit,
      top: findAndMerge(data.outfit.top),
      bottom: findAndMerge(data.outfit.bottom),
      footwear: findAndMerge(data.outfit.footwear),
      accessory: findAndMerge(data.outfit.accessory),
    };

    return {
      success: true,
      outfit: enrichedOutfit,
      message: 'Outfit generated successfully!',
    };
  } catch (error) {
    console.error('[OutfitGenerator] Error generating outfit:', error);
    return {
      success: false,
      outfit: null,
      message: 'Something went wrong while asking the AI Stylist. Please try again.',
    };
  }
}

/**
 * Checks wardrobe readiness for outfit generation.
 * (Simple local check to see if we have at least one of each required category)
 * 
 * @param {Array<Object>} allItems — All clothing items.
 * @returns {Object} Readiness per occasion.
 */
export function checkWardrobeReadiness(allItems) {
  const tops = allItems.filter(item => item.category === 'topwear').length;
  const bottoms = allItems.filter(item => item.category === 'bottomwear').length;
  const footwear = allItems.filter(item => item.category === 'footwear').length;

  const isReady = tops > 0 && bottoms > 0 && footwear > 0;

  // For now, we apply the same readiness to all occasions
  const readiness = {};
  ['casual', 'formal', 'party', 'sports'].forEach(occ => {
    readiness[occ] = {
      ready: isReady,
      counts: { tops, bottoms, footwear }
    };
  });

  return readiness;
}
