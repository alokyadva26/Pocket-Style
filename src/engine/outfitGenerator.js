/**
 * =============================================================================
 * PocketStylist — Outfit Generator Engine
 * =============================================================================
 * 
 * The core AI-like logic for generating outfit combinations.
 * Takes an occasion as input, queries the wardrobe database,
 * and returns a randomized but logically valid outfit.
 * 
 * Algorithm:
 *   1. Filter all items by the selected occasion tag
 *   2. Separate items into category buckets (tops, bottoms, footwear, accessories)
 *   3. Randomly pick 1 item from each required bucket
 *   4. Optionally pick 1 accessory
 *   5. Validate that at least the core outfit (top + bottom + footwear) is complete
 *   6. Return the outfit or an error describing what's missing
 */

import { getItemsByCategoryAndOccasion } from '../database/database';

/**
 * Generates a random outfit for the given occasion.
 * 
 * @param {string} occasion — The occasion to generate for (e.g., 'casual', 'formal').
 * @returns {Object} Result object with shape:
 *   {
 *     success: boolean,
 *     outfit: { top, bottom, footwear, accessory } | null,
 *     missingCategories: string[],
 *     message: string
 *   }
 */
export async function generateOutfit(occasion) {
  try {
    // Step 1: Fetch items for each category matching the occasion
    const [tops, bottoms, footwear, accessories] = await Promise.all([
      getItemsByCategoryAndOccasion('tops', occasion),
      getItemsByCategoryAndOccasion('bottoms', occasion),
      getItemsByCategoryAndOccasion('footwear', occasion),
      getItemsByCategoryAndOccasion('accessories', occasion),
    ]);

    // Step 2: Check which required categories are missing
    const missingCategories = [];
    if (tops.length === 0) missingCategories.push('Tops');
    if (bottoms.length === 0) missingCategories.push('Bottoms');
    if (footwear.length === 0) missingCategories.push('Footwear');

    // Step 3: If any required category is missing, return helpful error
    if (missingCategories.length > 0) {
      const occasionLabel = occasion.charAt(0).toUpperCase() + occasion.slice(1);
      return {
        success: false,
        outfit: null,
        missingCategories,
        message: `You need ${missingCategories.join(', ')} tagged as "${occasionLabel}" to generate an outfit. Add some items to your wardrobe first!`,
      };
    }

    // Step 4: Randomly pick one item from each category
    const outfit = {
      top: getRandomItem(tops),
      bottom: getRandomItem(bottoms),
      footwear: getRandomItem(footwear),
      accessory: accessories.length > 0 ? getRandomItem(accessories) : null,
    };

    return {
      success: true,
      outfit,
      missingCategories: [],
      message: 'Outfit generated successfully!',
    };
  } catch (error) {
    console.error('[OutfitGenerator] Error generating outfit:', error);
    return {
      success: false,
      outfit: null,
      missingCategories: [],
      message: 'Something went wrong while generating your outfit. Please try again.',
    };
  }
}

/**
 * Shuffles and returns a new outfit for the same occasion.
 * Simply calls generateOutfit again since selection is random.
 * 
 * @param {string} occasion — The occasion to shuffle for.
 * @returns {Object} Same result shape as generateOutfit.
 */
export async function shuffleOutfit(occasion) {
  return generateOutfit(occasion);
}

/**
 * Helper: Picks a random item from an array.
 * Uses Math.random for uniform distribution.
 * 
 * @param {Array} items — The array to pick from.
 * @returns {Object} A random item from the array.
 */
function getRandomItem(items) {
  if (!items || items.length === 0) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

/**
 * Checks wardrobe readiness for outfit generation.
 * Returns which occasions have enough items for a full outfit.
 * 
 * @param {Array<Object>} allItems — All clothing items.
 * @returns {Object} Readiness per occasion.
 */
export function checkWardrobeReadiness(allItems) {
  const occasions = ['casual', 'formal', 'party', 'sports'];

  return occasions.reduce((readiness, occasion) => {
    const tops = allItems.filter(
      (item) => item.category === 'tops' && item.occasions.includes(occasion)
    );
    const bottoms = allItems.filter(
      (item) => item.category === 'bottoms' && item.occasions.includes(occasion)
    );
    const footwear = allItems.filter(
      (item) => item.category === 'footwear' && item.occasions.includes(occasion)
    );

    readiness[occasion] = {
      ready: tops.length > 0 && bottoms.length > 0 && footwear.length > 0,
      counts: {
        tops: tops.length,
        bottoms: bottoms.length,
        footwear: footwear.length,
      },
    };

    return readiness;
  }, {});
}
