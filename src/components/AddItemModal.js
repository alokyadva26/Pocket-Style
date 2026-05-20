/**
 * =============================================================================
 * PocketStylist — Add Item Modal
 * =============================================================================
 * 
 * Full-screen modal for adding new clothing items to the wardrobe.
 * Features:
 *   - Camera capture or gallery selection
 *   - Category picker (Tops, Bottoms, Footwear, Accessories)
 *   - Multi-select occasion tags (Casual, Formal, Party, Sports)
 *   - Name input with auto-suggestion
 *   - Image preview with save/cancel actions
 * 
 * Uses expo-image-picker for camera/gallery integration and
 * expo-file-system for persistent local image storage.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, CATEGORIES, OCCASIONS } from '../constants/theme';
import useWardrobeStore from '../store/wardrobeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Generates a simple UUID v4-like string.
 * We avoid importing the full uuid package to keep bundle size small.
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AddItemModal({ visible, onClose }) {
  // ─── Form State ───────────────────────────────────────────────
  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = useWardrobeStore((state) => state.addItem);

  // ─── Image Selection ──────────────────────────────────────────

  /**
   * Opens the device camera to capture a photo.
   * Compresses the image to prevent memory bloat.
   */
  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to photograph your clothes.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7, // Compress to 70% to save storage and memory
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  /**
   * Opens the device gallery to pick an existing photo.
   */
  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed to select your clothes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  // ─── Occasion Toggle ─────────────────────────────────────────

  /**
   * Toggles an occasion tag on or off.
   */
  const toggleOccasion = useCallback((occasionId) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasionId)
        ? prev.filter((id) => id !== occasionId)
        : [...prev, occasionId]
    );
  }, []);

  // ─── Save Item ────────────────────────────────────────────────

  /**
   * Validates the form, copies the image to app storage,
   * and saves the item to the database.
   */
  const handleSave = useCallback(async () => {
    // Validation
    if (!imageUri) {
      Alert.alert('Missing Photo', 'Please take or select a photo of your clothing item.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please give your clothing item a name.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Missing Category', 'Please select a category for this item.');
      return;
    }
    if (selectedOccasions.length === 0) {
      Alert.alert('Missing Occasion', 'Please select at least one occasion tag.');
      return;
    }

    setIsSaving(true);

    try {
      // Create a persistent directory for wardrobe images
      const wardrobeDir = new Directory(Paths.document, 'wardrobe');
      if (!wardrobeDir.exists) {
        wardrobeDir.create();
      }

      // Copy image to app's local storage with a unique filename
      const itemId = generateId();
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const localFileName = `${itemId}.${fileExtension}`;

      const sourceFile = new File(imageUri);
      const destinationFile = new File(wardrobeDir, localFileName);
      sourceFile.copy(destinationFile);

      const localPath = destinationFile.uri;

      // Build the clothing item object
      const newItem = {
        id: itemId,
        name: name.trim(),
        category: selectedCategory,
        occasions: selectedOccasions,
        imagePath: localPath,
        color: '',
        createdAt: new Date().toISOString(),
      };

      // Save to database via Zustand action
      await addItem(newItem);

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error('[AddItemModal] Save failed:', error);
      Alert.alert('Save Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [imageUri, name, selectedCategory, selectedOccasions, addItem, onClose]);

  /**
   * Resets all form fields to their initial state.
   */
  const resetForm = useCallback(() => {
    setImageUri(null);
    setName('');
    setSelectedCategory(null);
    setSelectedOccasions([]);
  }, []);

  /**
   * Handles modal close — resets form and calls parent onClose.
   */
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // ─── Render ───────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add to Wardrobe</Text>
          <View style={styles.closeButton} /> 
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Image Picker Section ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Photo</Text>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  contentFit="cover"
                  transition={300}
                />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={() => setImageUri(null)}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePickerRow}>
                <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                  <Text style={styles.imagePickerIcon}>📷</Text>
                  <Text style={styles.imagePickerLabel}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickFromGallery}>
                  <Text style={styles.imagePickerIcon}>🖼️</Text>
                  <Text style={styles.imagePickerLabel}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Name Input ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✏️ Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Blue Oxford Shirt"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* ── Category Picker ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📂 Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    selectedCategory === cat.id && {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      selectedCategory === cat.id && styles.chipLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Occasion Tags ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Occasions</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            <View style={styles.chipRow}>
              {OCCASIONS.map((occ) => (
                <TouchableOpacity
                  key={occ.id}
                  style={[
                    styles.chip,
                    selectedOccasions.includes(occ.id) && {
                      backgroundColor: occ.color,
                      borderColor: occ.color,
                    },
                  ]}
                  onPress={() => toggleOccasion(occ.id)}
                >
                  <Text style={styles.chipIcon}>{occ.icon}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      selectedOccasions.includes(occ.id) && styles.chipLabelActive,
                    ]}
                  >
                    {occ.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Spacer for button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Save Button ── */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.textPrimary} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save to Wardrobe</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// =============================================================================
// Styles
// =============================================================================

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
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semiBold,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.sm,
  },

  // Image Picker
  imagePickerRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  imagePickerButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerIcon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  imagePickerLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: SCREEN_WIDTH - SPACING.base * 2,
    height: (SCREEN_WIDTH - SPACING.base * 2) * 1.2,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
  },
  changePhotoButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  changePhotoText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },

  // Text Input
  textInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.base,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  chipLabelActive: {
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.bold,
  },

  // Save Button
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.base,
    paddingBottom: SPACING['2xl'],
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
});
