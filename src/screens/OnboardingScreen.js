import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/useUserStore';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const BODY_TYPES = ['Rectangle', 'Triangle', 'Hourglass', 'Inverted Triangle', 'Oval'];
const STYLES = ['Casual', 'Streetwear', 'Formal', 'Minimalist', 'Vintage', 'Athleisure'];

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { updateProfile, loading } = useUserStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: '',
    body_type: '',
    preferred_styles: [],
  });

  const handleStyleToggle = (style) => {
    setFormData((prev) => {
      const styles = prev.preferred_styles.includes(style)
        ? prev.preferred_styles.filter((s) => s !== style)
        : [...prev.preferred_styles, style];
      return { ...prev, preferred_styles: styles };
    });
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!session?.user?.id) {
        Alert.alert('Error', 'No authenticated user found');
        return;
      }
      try {
        await updateProfile(session.user.id, {
          ...formData,
          onboarding_completed: true,
        });
      } catch (error) {
        Alert.alert('Error saving profile', error.message);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What is your gender?</Text>
            <Text style={styles.subtitle}>This helps us tailor outfit fits.</Text>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.optionCard, formData.gender === g && styles.selectedCard]}
                onPress={() => setFormData({ ...formData, gender: g })}
              >
                <Text style={[styles.optionText, formData.gender === g && styles.selectedText]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What's your body type?</Text>
            <Text style={styles.subtitle}>This helps the AI recommend flattering silhouettes.</Text>
            {BODY_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt}
                style={[styles.optionCard, formData.body_type === bt && styles.selectedCard]}
                onPress={() => setFormData({ ...formData, body_type: bt })}
              >
                <Text style={[styles.optionText, formData.body_type === bt && styles.selectedText]}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Select your preferred styles</Text>
            <Text style={styles.subtitle}>Choose as many as you like.</Text>
            <View style={styles.gridContainer}>
              {STYLES.map((style) => {
                const isSelected = formData.preferred_styles.includes(style);
                return (
                  <TouchableOpacity
                    key={style}
                    style={[styles.gridItem, isSelected && styles.selectedCard]}
                    onPress={() => handleStyleToggle(style)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>{style}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.dot, step >= s && styles.dotActive]} />
          ))}
        </View>

        {renderStep()}

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.buttonText}>{step === 3 ? 'Complete Profile' : 'Next'}</Text>
          )}
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
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10', // slightly tinted
  },
  optionText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
  },
});
