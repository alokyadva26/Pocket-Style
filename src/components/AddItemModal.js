import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import useWardrobeStore from '../store/wardrobeStore';
import { useAuth } from '../context/AuthContext';
import { uploadImageToSupabase, analyzeClothingItem } from '../api/wardrobeApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AddItemModal({ visible, onClose }) {
  const [imageUri, setImageUri] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { session } = useAuth();
  const loadItems = useWardrobeStore((state) => state.loadItems);

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
      quality: 0.7, 
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

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

  const handleAnalyzeAndSave = async () => {
    if (!imageUri) return;
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to add items.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // 1. Upload the image to Supabase Storage
      const publicUrl = await uploadImageToSupabase(imageUri, session.user.id);
      
      // 2. Trigger the Gemini Vision AI Edge Function
      await analyzeClothingItem(publicUrl);
      
      // 3. Reload wardrobe to show the newly added AI-analyzed item
      await loadItems();
      
      handleClose();
    } catch (error) {
      console.error('[AddItemModal] AI Analysis failed:', error);
      Alert.alert('Analysis Failed', error.message || 'Something went wrong while analyzing the image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = useCallback(() => {
    setImageUri(null);
    setIsAnalyzing(false);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add to Wardrobe</Text>
          <View style={styles.closeButton} /> 
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>📸 Provide a Photo</Text>
          <Text style={styles.sectionSubtitle}>
            Our AI Stylist will automatically analyze the color, fabric, pattern, and style of your clothing.
          </Text>

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
                disabled={isAnalyzing}
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

          {isAnalyzing && (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.analyzingText}>AI is analyzing your clothing...</Text>
            </View>
          )}
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, (!imageUri || isAnalyzing) && styles.saveButtonDisabled]}
            onPress={handleAnalyzeAndSave}
            disabled={!imageUri || isAnalyzing}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Analyze & Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  content: {
    padding: SPACING.base,
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semiBold,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
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
  analyzingContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingText: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold,
  },
  saveButtonContainer: {
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
