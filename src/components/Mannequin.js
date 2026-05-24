import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import useAvatarStore from '../store/avatarStore';
import { COLORS } from '../constants/theme';

/**
 * PocketStylist — Simulated Virtual Try-On Mannequin & Styling Studio
 * 
 * Renders a highly interactive, stylized avatar mannequin based on user preferences.
 * Supports dual-mode visualization:
 *  1. "Avatar Fit" Mode: Layers realistic clothing overlays directly on the silhouette
 *     using a custom zIndex sandwich structure (arms, neck, feet are rendered in front
 *     to cover clothing photo edges) and anatomical silhouette corner clipping.
 *  2. "Studio Slots" Mode: Renders clothing in glassmorphic sidebar circles with neon
 *     indicator lines pointing to corresponding body parts.
 */
export default function Mannequin({ outfit, scale = 1 }) {
  const preferences = useAvatarStore((state) => state.preferences);
  const [viewMode, setViewMode] = useState('tryon'); // 'tryon' (Avatar Fit) | 'studio' (Studio Slots)

  // Determine body shape width multipliers
  let bodyWidthMult = 1;
  let hipWidthMult = 1;
  
  if (preferences.bodyType === 'hourglass') {
    hipWidthMult = 1.1;
    bodyWidthMult = 0.9;
  } else if (preferences.bodyType === 'rectangle') {
    hipWidthMult = 1;
    bodyWidthMult = 1;
  } else if (preferences.bodyType === 'triangle') {
    hipWidthMult = 1.2;
    bodyWidthMult = 0.85;
  }

  const skinTone = preferences.skinTone || '#EAC086';

  // Calculate pixel-perfect centered widths and offsets for clothes overlays
  const torsoWidth = 120 * bodyWidthMult;
  const topWidth = torsoWidth + 8;
  const topLeft = (180 - topWidth) / 2;

  const bottomWidth = 110 * hipWidthMult + 8;
  const bottomLeft = (180 - bottomWidth) / 2;

  // Calculate dynamic offsets for the left and right arms to attach perfectly to the torso shoulders
  const armLeftPos = (180 - torsoWidth) / 2 - 20;
  const armRightPos = (180 - torsoWidth) / 2 - 20;

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      
      {/* --- SLEEK GLASSMORPHIC MODE SELECTOR --- */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'tryon' && styles.toggleButtonActive]}
          onPress={() => setViewMode('tryon')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'tryon' && styles.toggleButtonTextActive]}>
            👗 Avatar Fit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'studio' && styles.toggleButtonActive]}
          onPress={() => setViewMode('studio')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'studio' && styles.toggleButtonTextActive]}>
            💎 Studio Slots
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* --- CENTERED MANNEQUIN SILHOUETTE --- */}
      <View style={styles.mannequinBase}>
        {/* Head (zIndex: 10 to overlap overlays) */}
        <View style={[styles.head, { backgroundColor: skinTone, zIndex: 10 }]} />
        
        {/* Neck (zIndex: 10 to overlap shirt collar) */}
        <View style={[styles.neck, { backgroundColor: skinTone, zIndex: 10 }]} />
        
        {/* Torso Base (zIndex: 1, drawn behind clothes) */}
        <View style={[styles.torso, { 
          backgroundColor: skinTone,
          width: 120 * bodyWidthMult,
          zIndex: 1,
        }]} />
        
        {/* Hips Base (zIndex: 1, drawn behind clothes) */}
        <View style={[styles.hips, { 
          backgroundColor: skinTone,
          width: 120 * hipWidthMult,
          zIndex: 1,
        }]} />
        
        {/* Legs Base (zIndex: 1, drawn behind clothes) */}
        <View style={[styles.legsContainer, { zIndex: 1 }]}>
          <View style={[styles.leg, { backgroundColor: skinTone }]} />
          <View style={[styles.leg, { backgroundColor: skinTone }]} />
        </View>

        {/* Feet (zIndex: 10, drawn in front of pants/behind shoes) */}
        <View style={[styles.feetContainer, { zIndex: 10 }]}>
          <View style={[styles.footLeft, { backgroundColor: skinTone }]} />
          <View style={[styles.footRight, { backgroundColor: skinTone }]} />
        </View>

        {/* Arms (zIndex: 10, covers the shirt edges on the sides) */}
        <View style={[styles.armLeft, { backgroundColor: skinTone, left: armLeftPos, zIndex: 10 }]} />
        <View style={[styles.armRight, { backgroundColor: skinTone, right: armRightPos, zIndex: 10 }]} />

        {/* --- LAYERED CLOTHING OVERLAYS FOR AVATAR FIT --- */}
        {viewMode === 'tryon' && outfit?.top && (
          <View style={[
            styles.tryOnTop, 
            { 
              width: topWidth,
              left: topLeft,
              borderColor: COLORS.categoryTop, 
              zIndex: 5,
            }
          ]}>
            <Image
              source={{ uri: outfit.top.imagePath || outfit.top.image_url }}
              style={styles.tryOnImage}
              contentFit="cover"
            />
          </View>
        )}

        {viewMode === 'tryon' && outfit?.bottom && (
          <View style={[
            styles.tryOnBottom, 
            { 
              width: bottomWidth,
              left: bottomLeft,
              borderColor: COLORS.categoryBottom, 
              zIndex: 4, // Sandwiched behind the topwear if tucked
            }
          ]}>
            <Image
              source={{ uri: outfit.bottom.imagePath || outfit.bottom.image_url }}
              style={styles.tryOnImage}
              contentFit="cover"
            />
          </View>
        )}

        {viewMode === 'tryon' && outfit?.footwear && (
          <>
            {/* Left Shoe Overlay */}
            <View style={[styles.tryOnShoeLeft, { left: 36, borderColor: COLORS.categoryFootwear, zIndex: 6 }]}>
              <Image
                source={{ uri: outfit.footwear.imagePath || outfit.footwear.image_url }}
                style={styles.tryOnImage}
                contentFit="contain"
              />
            </View>
            {/* Right Shoe Overlay */}
            <View style={[styles.tryOnShoeRight, { right: 36, borderColor: COLORS.categoryFootwear, zIndex: 6 }]}>
              <Image
                source={{ uri: outfit.footwear.imagePath || outfit.footwear.image_url }}
                style={styles.tryOnImage}
                contentFit="contain"
              />
            </View>
          </>
        )}

        {viewMode === 'tryon' && outfit?.accessory && (
          /* Wrist Bracelet/Watch accessory band layered dynamically on left arm */
          <View style={[
            styles.tryOnAccessory, 
            { 
              borderColor: COLORS.categoryAccessory, 
              left: armLeftPos + 5,
              zIndex: 12 
            }
          ]}>
            <Image
              source={{ uri: outfit.accessory.imagePath || outfit.accessory.image_url }}
              style={styles.tryOnImage}
              contentFit="cover"
            />
          </View>
        )}
      </View>

      {/* --- STUDIO SLOTS (viewMode === 'studio') --- */}
      {viewMode === 'studio' && (
        <>
          {/* 1. TOPWEAR SLOT (Left, top: 75) */}
          <View style={[styles.slotContainer, { left: 10, top: 75 }]}>
            <Text style={styles.slotTag}>TOPWEAR</Text>
            <View style={[
              styles.slotCircle,
              { borderColor: COLORS.categoryTop },
              outfit?.top ? styles.slotFilledGlow : styles.slotEmptyDashed
            ]}>
              {outfit?.top ? (
                <Image
                  source={{ uri: outfit.top.imagePath || outfit.top.image_url }}
                  style={styles.slotImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.placeholderIcon}>👕</Text>
              )}
            </View>
          </View>
          {/* Indicator Line from topwear slot (x=80) to torso area (x=120) at y=110 */}
          {outfit?.top && (
            <View style={[styles.indicatorLine, { left: 80, top: 110, width: 40, backgroundColor: COLORS.categoryTop }]} />
          )}

          {/* 2. ACCESSORY SLOT (Right, top: 45) */}
          <View style={[styles.slotContainer, { right: 10, top: 45 }]}>
            <Text style={styles.slotTagRight}>ACCESSORY</Text>
            <View style={[
              styles.slotCircle,
              { borderColor: COLORS.categoryAccessory },
              outfit?.accessory ? styles.slotFilledGlow : styles.slotEmptyDashed
            ]}>
              {outfit?.accessory ? (
                <Image
                  source={{ uri: outfit.accessory.imagePath || outfit.accessory.image_url }}
                  style={styles.slotImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.placeholderIcon}>⌚</Text>
              )}
            </View>
          </View>
          {/* Indicator Line from accessory slot (x=240) to neck area (x=200) at y=80 */}
          {outfit?.accessory && (
            <View style={[styles.indicatorLine, { right: 80, top: 80, width: 40, backgroundColor: COLORS.categoryAccessory }]} />
          )}

          {/* 3. BOTTOMWEAR SLOT (Right, top: 215) */}
          <View style={[styles.slotContainer, { right: 10, top: 215 }]}>
            <Text style={styles.slotTagRight}>BOTTOMWEAR</Text>
            <View style={[
              styles.slotCircle,
              { borderColor: COLORS.categoryBottom },
              outfit?.bottom ? styles.slotFilledGlow : styles.slotEmptyDashed
            ]}>
              {outfit?.bottom ? (
                <Image
                  source={{ uri: outfit.bottom.imagePath || outfit.bottom.image_url }}
                  style={styles.slotImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.placeholderIcon}>👖</Text>
              )}
            </View>
          </View>
          {/* Indicator Line from bottomwear slot (x=240) to hip area (x=200) at y=250 */}
          {outfit?.bottom && (
            <View style={[styles.indicatorLine, { right: 80, top: 250, width: 40, backgroundColor: COLORS.categoryBottom }]} />
          )}

          {/* 4. FOOTWEAR SLOT (Left, top: 315) */}
          <View style={[styles.slotContainer, { left: 10, top: 315 }]}>
            <Text style={styles.slotTag}>FOOTWEAR</Text>
            <View style={[
              styles.slotCircle,
              { borderColor: COLORS.categoryFootwear },
              outfit?.footwear ? styles.slotFilledGlow : styles.slotEmptyDashed
            ]}>
              {outfit?.footwear ? (
                <Image
                  source={{ uri: outfit.footwear.imagePath || outfit.footwear.image_url }}
                  style={styles.slotImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.placeholderIcon}>👟</Text>
              )}
            </View>
          </View>
          {/* Indicator Line from footwear slot (x=80) to leg area (x=120) at y=350 */}
          {outfit?.footwear && (
            <View style={[styles.indicatorLine, { left: 80, top: 350, width: 40, backgroundColor: COLORS.categoryFootwear }]} />
          )}
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 480,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  // --- Sleek Glassmorphic Mode Selector ---
  toggleContainer: {
    flexDirection: 'row',
    width: '90%',
    height: 38,
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderRadius: 19,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 30,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  toggleButtonTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  // Centered mannequin silhouette canvas
  mannequinBase: {
    width: 180,
    height: 420,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    position: 'relative',
    opacity: 0.9,
  },
  // --- Mannequin Shapes ---
  head: {
    width: 48,
    height: 60,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  neck: {
    width: 18,
    height: 22,
    marginTop: -4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  torso: {
    height: 110,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  hips: {
    height: 55,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    marginTop: -8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  legsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -16,
  },
  leg: {
    width: 42,
    height: 150,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  armLeft: {
    position: 'absolute',
    width: 26,
    height: 150,
    borderRadius: 13,
    top: 85,
    left: -5,
    transform: [{ rotate: '15deg' }],
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  armRight: {
    position: 'absolute',
    width: 26,
    height: 150,
    borderRadius: 13,
    top: 85,
    right: -5,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  feetContainer: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 22,
    bottom: 25,
  },
  footLeft: {
    width: 28,
    height: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footRight: {
    width: 28,
    height: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // --- Layered Try-On Overlays ---
  tryOnTop: {
    position: 'absolute',
    top: 84,
    height: 130,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
  },
  tryOnBottom: {
    position: 'absolute',
    top: 198,
    height: 160,
    borderRadius: 12,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
  },
  tryOnShoeLeft: {
    position: 'absolute',
    bottom: 12,
    left: 28,
    width: 52,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    transform: [{ rotate: '12deg' }],
  },
  tryOnShoeRight: {
    position: 'absolute',
    bottom: 12,
    right: 28,
    width: 52,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    transform: [{ rotate: '-12deg' }],
  },
  tryOnAccessory: {
    position: 'absolute',
    top: 190,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  tryOnImage: {
    width: '100%',
    height: '100%',
  },

  // --- Interactive Slots ---
  slotContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 75,
    zIndex: 20,
  },
  slotCircle: {
    width: 75,
    height: 75,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  slotFilledGlow: {
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  slotEmptyDashed: {
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  placeholderIcon: {
    fontSize: 28,
  },
  slotTag: {
    fontSize: 8,
    color: '#8B8D99',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  slotTagRight: {
    fontSize: 8,
    color: '#8B8D99',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  indicatorLine: {
    position: 'absolute',
    height: 1.5,
    opacity: 0.45,
    zIndex: 10,
  },
});

