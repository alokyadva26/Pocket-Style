import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store for managing the user's customizable avatar.
 * We use persist middleware to save preferences locally.
 */
const useAvatarStore = create(
  persist(
    (set) => ({
      // Default preferences
      preferences: {
        gender: 'female',
        skinTone: '#EAC086', // Default warm tone
        bodyType: 'hourglass',
        hairstyle: 'short',
      },

      // Actions
      updatePreferences: (newPrefs) => set((state) => ({
        preferences: { ...state.preferences, ...newPrefs }
      })),

      resetPreferences: () => set({
        preferences: {
          gender: 'female',
          skinTone: '#EAC086',
          bodyType: 'hourglass',
          hairstyle: 'short',
        }
      }),
    }),
    {
      name: 'pocketstylist-avatar-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAvatarStore;
