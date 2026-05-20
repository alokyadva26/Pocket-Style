/**
 * PocketStylist — My Closet Screen
 * Wardrobe dashboard with category filters, grid view, and add item FAB.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, CATEGORIES } from '../constants/theme';
import useWardrobeStore from '../store/wardrobeStore';
import ClothingCard from '../components/ClothingCard';
import AddItemModal from '../components/AddItemModal';
import EmptyState from '../components/EmptyState';

export default function ClosetScreen() {
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const items = useWardrobeStore((s) => s.items);
  const categoryCounts = useWardrobeStore((s) => s.categoryCounts);
  const selectedCategory = useWardrobeStore((s) => s.selectedCategory);
  const setSelectedCategory = useWardrobeStore((s) => s.setSelectedCategory);
  const loadItems = useWardrobeStore((s) => s.loadItems);
  const getFilteredItems = useWardrobeStore((s) => s.getFilteredItems);

  useEffect(() => { loadItems(); }, []);

  const filteredItems = getFilteredItems();
  const totalItems = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadItems();
    setIsRefreshing(false);
  }, [loadItems]);

  const renderItem = useCallback(({ item }) => <ClothingCard item={item} />, []);
  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Closet</Text>
          <Text style={styles.headerSub}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
        </View>
        <View style={styles.headerIcon}><Text style={{ fontSize: 28 }}>👗</Text></View>
      </View>

      {/* Category Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>
            All ({totalItems})
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.id && { backgroundColor: cat.color + '25', borderColor: cat.color }]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Text style={styles.chipIcon}>{cat.icon}</Text>
            <Text style={[styles.chipText, selectedCategory === cat.id && { color: cat.color }]}>
              {categoryCounts[cat.id] || 0}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="👕"
          title="Your wardrobe is empty"
          description="Start building your digital wardrobe by adding photos of your clothes!"
          actionLabel="Add First Item"
          onAction={() => setAddModalVisible(true)}
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={8}
          windowSize={5}
          initialNumToRender={6}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh}
              tintColor={COLORS.primary} colors={[COLORS.primary]} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddItemModal visible={isAddModalVisible} onClose={() => setAddModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingTop: SPACING['3xl'], paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY['2xl'], fontWeight: TYPOGRAPHY.extraBold },
  headerSub: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, marginTop: 2 },
  headerIcon: {
    width: 48, height: 48, backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md, gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md, borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, gap: 4,
  },
  chipActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  chipIcon: { fontSize: 14 },
  chipText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium },
  chipTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.bold },
  gridContent: { padding: SPACING.base, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between' },
  fab: {
    position: 'absolute', bottom: SPACING.xl, right: SPACING.base,
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow,
  },
  fabIcon: { color: COLORS.textPrimary, fontSize: 32, fontWeight: TYPOGRAPHY.light, marginTop: -2 },
});
