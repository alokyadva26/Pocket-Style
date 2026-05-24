/**
 * =============================================================================
 * PocketStylist — Outfit Display Card Component
 * =============================================================================
 * 
 * Visually displays a single outfit slot (Top, Bottom, Footwear, Accessory)
 * in the Style Me screen. Shows the item image, name, and category label
 * in a premium card layout.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, CATEGORIES } from '../constants/theme';

/**
 * @param {Object} props
 * @param {Object} props.item — The clothing item data (or null if slot is empty).
 * @param {string} props.slotLabel — Label for the slot (e.g., "Top", "Bottom").
 * @param {string} props.slotIcon — Emoji icon for the slot.
 */
export default function OutfitCard({ item, slotLabel, slotIcon }) {
  // Fallbacks to support both local mock data schema and new Supabase schema
  const imageUri = item?.imagePath || item?.image_url;
  const itemName = item?.name || item?.clothing_type || 'Item';
  
  let catId = item?.category;
  if (catId === 'topwear') catId = 'tops';
  if (catId === 'bottomwear') catId = 'bottoms';
  if (catId === 'accessory') catId = 'accessories';
  const categoryConfig = CATEGORIES.find((c) => c.id === catId);

  if (!item) {
    // Empty slot placeholder
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>{slotIcon}</Text>
        <Text style={styles.emptyLabel}>No {slotLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Category accent */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: categoryConfig?.color || COLORS.primary },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Item thumbnail */}
        <Image
          source={{ uri: imageUri }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />

        {/* Item details */}
        <View style={styles.details}>
          <Text style={styles.slotLabel}>
            {slotIcon} {slotLabel}
          </Text>
          <Text style={styles.itemName} numberOfLines={2}>
            {itemName.charAt(0).toUpperCase() + itemName.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  slotLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semiBold,
  },

  // Empty slot
  emptyCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: SPACING.md,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.medium,
  },
});
