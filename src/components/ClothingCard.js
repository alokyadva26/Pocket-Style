/**
 * =============================================================================
 * PocketStylist — Clothing Item Card Component
 * =============================================================================
 * 
 * Displays a single clothing item in the wardrobe grid.
 * Features:
 *   - Optimized image rendering with expo-image (caching + transitions)
 *   - Category color accent bar
 *   - Occasion tag badges
 *   - Long-press to delete with confirmation
 *   - Smooth press animation
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, CATEGORIES, OCCASIONS } from '../constants/theme';
import useWardrobeStore from '../store/wardrobeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = SPACING.sm;
const CARD_PADDING = SPACING.base;
// Calculate card width for a 2-column grid with gaps
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

/**
 * Renders a single clothing item card in the wardrobe grid.
 * 
 * @param {Object} props
 * @param {Object} props.item — The clothing item data.
 */
export default function ClothingCard({ item }) {
  const deleteItem = useWardrobeStore((state) => state.deleteItem);

  // Find the category config for color coding
  const categoryConfig = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0];

  /**
   * Shows a confirmation dialog before deleting the item.
   */
  const handleLongPress = useCallback(() => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${item.name}" from your wardrobe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  }, [item, deleteItem]);

  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
      delayLongPress={500}
    >
      {/* Category color accent bar at top */}
      <View style={[styles.accentBar, { backgroundColor: categoryConfig.color }]} />

      {/* Clothing image — using expo-image for performance */}
      <Image
        source={{ uri: item.imagePath }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        recyclingKey={item.id}
      />

      {/* Item info overlay */}
      <View style={styles.infoContainer}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Occasion badges */}
        <View style={styles.badgeRow}>
          {item.occasions.slice(0, 2).map((occ) => {
            const occConfig = OCCASIONS.find((o) => o.id === occ);
            return (
              <View
                key={occ}
                style={[styles.badge, { backgroundColor: occConfig?.color + '30' }]}
              >
                <Text style={[styles.badgeText, { color: occConfig?.color }]}>
                  {occConfig?.label || occ}
                </Text>
              </View>
            );
          })}
          {item.occasions.length > 2 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+{item.occasions.length - 2}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: CARD_GAP,
    ...SHADOWS.md,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: COLORS.surfaceLight,
  },
  infoContainer: {
    padding: SPACING.sm,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semiBold,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textMuted,
  },
});
