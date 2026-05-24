import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import useAvatarStore from '../store/avatarStore';
import Mannequin from '../components/Mannequin';

// Skin tone presets
const SKIN_TONES = [
  '#FCE2C6', // Light
  '#EAC086', // Medium Light
  '#C68642', // Medium
  '#8D5524', // Dark
  '#3C2218', // Deep
];

const BODY_TYPES = [
  { id: 'hourglass', label: 'Hourglass' },
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'triangle', label: 'Triangle' },
];

export default function TryOnScreen({ route, navigation }) {
  const { outfit } = route.params || {};
  const { preferences, updatePreferences } = useAvatarStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveOutfit = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Saved!', 'This outfit has been saved to your favorites.');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Try-On</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Mannequin Preview Area */}
        <View style={styles.previewCard}>
          <Mannequin outfit={outfit} scale={0.9} />
        </View>

        {/* Customization Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.controlsTitle}>Avatar Settings</Text>

          {/* Skin Tone Selector */}
          <Text style={styles.label}>Skin Tone</Text>
          <View style={styles.row}>
            {SKIN_TONES.map(tone => (
              <TouchableOpacity
                key={tone}
                style={[
                  styles.colorSwatch, 
                  { backgroundColor: tone },
                  preferences.skinTone === tone && styles.colorSwatchSelected
                ]}
                onPress={() => updatePreferences({ skinTone: tone })}
                activeOpacity={0.7}
              />
            ))}
          </View>

          {/* Body Type Selector */}
          <Text style={[styles.label, { marginTop: SPACING.md }]}>Body Type</Text>
          <View style={styles.row}>
            {BODY_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.pillButton,
                  preferences.bodyType === type.id && styles.pillButtonSelected
                ]}
                onPress={() => updatePreferences({ bodyType: type.id })}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pillText,
                  preferences.bodyType === type.id && styles.pillTextSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gender & Hairstyle (Simulated Toggles) */}
          <Text style={[styles.label, { marginTop: SPACING.md }]}>Gender Presentation</Text>
          <View style={styles.row}>
            {['female', 'male', 'unisex'].map(gender => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.pillButton,
                  preferences.gender === gender && styles.pillButtonSelected
                ]}
                onPress={() => updatePreferences({ gender })}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pillText,
                  preferences.gender === gender && styles.pillTextSelected
                ]}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveOutfit}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : '💾 Save Outfit'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  controlsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  controlsTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  pillButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillButtonSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  pillTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  saveButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
});
