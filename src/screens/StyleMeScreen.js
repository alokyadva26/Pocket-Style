/**
 * PocketStylist — Style Me Screen
 * The outfit generator UI with occasion dropdown, generate/shuffle buttons,
 * and a visual stack of the selected outfit items.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Animated, ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, OCCASIONS } from '../constants/theme';
import { generateOutfit, checkWardrobeReadiness } from '../engine/outfitGenerator';
import useWardrobeStore from '../store/wardrobeStore';
import OutfitCard from '../components/OutfitCard';
import EmptyState from '../components/EmptyState';

export default function StyleMeScreen({ navigation }) {
  // State
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [outfit, setOutfit] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [readiness, setReadiness] = useState({});
  const [showOccasionPicker, setShowOccasionPicker] = useState(false);

  const items = useWardrobeStore((s) => s.items);
  const loadItems = useWardrobeStore((s) => s.loadItems);

  // Fade animation for outfit reveal
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Load items and check readiness on mount
  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      setReadiness(checkWardrobeReadiness(items));
    }
  }, [items]);

  /**
   * Generates a new outfit for the selected occasion.
   */
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setErrorMessage('');
    setOutfit(null);
    fadeAnim.setValue(0);

    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 400));

    const result = await generateOutfit(selectedOccasion);

    if (result.success) {
      setOutfit(result.outfit);
      setHasGenerated(true);
      // Animate outfit cards in
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      setErrorMessage(result.message);
      setHasGenerated(true);
    }

    setIsGenerating(false);
  }, [selectedOccasion, fadeAnim]);

  /**
   * Shuffles to a new random outfit (same occasion).
   */
  const handleShuffle = useCallback(async () => {
    await handleGenerate();
  }, [handleGenerate]);

  // Get the selected occasion config
  const selectedOccConfig = OCCASIONS.find((o) => o.id === selectedOccasion);
  const isReady = readiness[selectedOccasion]?.ready;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Style Me</Text>
          <Text style={styles.headerSub}>AI-powered outfit generator</Text>
        </View>
        <View style={styles.headerIcon}><Text style={{ fontSize: 28 }}>✨</Text></View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <EmptyState
            icon="🪄"
            title="Add items first"
            description="You need clothes in your wardrobe before we can style you. Head to My Closet and add some items!"
          />
        ) : (
          <>
            {/* Occasion Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose an Occasion</Text>
              <View style={styles.occasionGrid}>
                {OCCASIONS.map((occ) => {
                  const isSelected = selectedOccasion === occ.id;
                  const occReady = readiness[occ.id]?.ready;
                  return (
                    <TouchableOpacity
                      key={occ.id}
                      style={[
                        styles.occasionCard,
                        isSelected && { backgroundColor: occ.color + '20', borderColor: occ.color },
                      ]}
                      onPress={() => {
                        setSelectedOccasion(occ.id);
                        setOutfit(null);
                        setErrorMessage('');
                        setHasGenerated(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.occasionIcon}>{occ.icon}</Text>
                      <Text style={[styles.occasionLabel, isSelected && { color: occ.color }]}>
                        {occ.label}
                      </Text>
                      {/* Readiness indicator */}
                      <View style={[styles.readyDot, { backgroundColor: occReady ? COLORS.success : COLORS.error }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Readiness detail */}
              {readiness[selectedOccasion] && !isReady && (
                <View style={styles.readinessWarning}>
                  <Text style={styles.readinessText}>
                    ⚠️ Missing: {
                      Object.entries(readiness[selectedOccasion]?.counts || {})
                        .filter(([, count]) => count === 0)
                        .map(([cat]) => cat.charAt(0).toUpperCase() + cat.slice(1))
                        .join(', ')
                    } for {selectedOccConfig?.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={handleGenerate}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <View style={styles.generateButtonContent}>
                  <ActivityIndicator color={COLORS.textPrimary} size="small" />
                  <Text style={styles.generateButtonText}>Styling...</Text>
                </View>
              ) : (
                <View style={styles.generateButtonContent}>
                  <Text style={styles.generateButtonIcon}>✨</Text>
                  <Text style={styles.generateButtonText}>Generate Outfit</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>😅</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Generated Outfit Display */}
            {outfit && (
              <Animated.View style={[styles.outfitContainer, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <View style={styles.outfitHeader}>
                  <Text style={styles.outfitTitle}>
                    {selectedOccConfig?.icon} Your {selectedOccConfig?.label} Outfit
                  </Text>
                  <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle} activeOpacity={0.7}>
                    <Text style={styles.shuffleIcon}>🔀</Text>
                    <Text style={styles.shuffleText}>Shuffle</Text>
                  </TouchableOpacity>
                </View>

                <OutfitCard item={outfit.top} slotLabel="Top" slotIcon="👕" />
                <OutfitCard item={outfit.bottom} slotLabel="Bottom" slotIcon="👖" />
                <OutfitCard item={outfit.footwear} slotLabel="Footwear" slotIcon="👟" />
                <OutfitCard
                  item={outfit.accessory}
                  slotLabel="Accessory"
                  slotIcon="⌚"
                />

                {/* Virtual Try-On Button */}
                <TouchableOpacity
                  style={styles.tryOnButton}
                  onPress={() => navigation.navigate('TryOn', { outfit })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tryOnButtonIcon}>👗</Text>
                  <Text style={styles.tryOnButtonText}>Virtual Try-On</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Prompt before first generation */}
            {!hasGenerated && !isGenerating && (
              <View style={styles.promptContainer}>
                <Text style={styles.promptIcon}>👆</Text>
                <Text style={styles.promptText}>
                  Select an occasion and tap Generate to create your outfit!
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },

  // Sections
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semiBold, marginBottom: SPACING.md,
  },

  // Occasion grid
  occasionGrid: { flexDirection: 'row', gap: SPACING.sm },
  occasionCard: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.base,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  occasionIcon: { fontSize: 24, marginBottom: SPACING.xs },
  occasionLabel: {
    color: COLORS.textSecondary, fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semiBold, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  readyDot: { width: 6, height: 6, borderRadius: 3, marginTop: SPACING.xs },

  // Readiness warning
  readinessWarning: {
    marginTop: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.warning + '30',
  },
  readinessText: { color: COLORS.warning, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium },

  // Generate button
  generateButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl, marginBottom: SPACING.xl,
    alignItems: 'center', ...SHADOWS.glow,
  },
  generateButtonDisabled: { opacity: 0.6 },
  generateButtonContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  generateButtonIcon: { fontSize: 20 },
  generateButtonText: {
    color: COLORS.textPrimary, fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold,
  },

  // Error
  errorContainer: {
    padding: SPACING.xl, alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginBottom: SPACING.xl,
  },
  errorIcon: { fontSize: 48, marginBottom: SPACING.md },
  errorText: {
    color: COLORS.textSecondary, fontSize: TYPOGRAPHY.base,
    textAlign: 'center', lineHeight: 22,
  },

  // Outfit display
  outfitContainer: { marginBottom: SPACING.xl },
  outfitHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  outfitTitle: {
    color: COLORS.textPrimary, fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold,
  },
  shuffleButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border,
  },
  shuffleIcon: { fontSize: 16 },
  shuffleText: {
    color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semiBold,
  },

  // Pre-generate prompt
  promptContainer: {
    alignItems: 'center', paddingVertical: SPACING['3xl'],
  },
  promptIcon: { fontSize: 36, marginBottom: SPACING.md },
  promptText: {
    color: COLORS.textMuted, fontSize: TYPOGRAPHY.base,
    textAlign: 'center', lineHeight: 22,
  },

  // Try-On Button
  tryOnButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  tryOnButtonIcon: { fontSize: 20 },
  tryOnButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
});
