# 👗 PocketStylist — AI Virtual Wardrobe & Interactive Try-On Studio

PocketStylist is a premium, AI-powered personal styling and digital wardrobe mobile application built with **React Native (Expo SDK 54)** and **Supabase**. The app serves as a visual personal stylist, letting users photograph their wardrobe, organize items, get AI-powered outfit recommendations for any weather or occasion, and preview combinations on a fully interactive virtual mannequin.

---

## ✨ Core Features

### 1. 👗 Interactive Virtual Mannequin Studio
The styling studio features a highly interactive 2D mannequin built using standard React Native components that dynamically adjust to user preferences:
- **Anatomical Adjustments**: Mannequin dimensions, body curves, and skin tones adapt dynamically based on user selections (e.g., *Hourglass*, *Triangle*, *Rectangle* shapes).
- **Dual Visual Modes**:
  - **Avatar Fit Mode**: Advanced layer-sandwiching structure (`zIndex`) overlays clothing photos directly onto the avatar's silhouette with precision clipping.
  - **Studio Slots Mode**: Displays selected clothing in glowing glassmorphic sidebar circles with neon tracking lines linking each item to its corresponding body part.

### 2. 🧠 AI-Powered Smart Stylist
- **Customized Recommendations**: Generates styled outfits based on context, such as the occasion (casual, formal, sports, party) and weather condition (sunny, chilly).
- **Edge Function Orchestration**: Offloads outfit logic to a serverless **Supabase Edge Function** (`generate-outfit`) that analyzes the user's wardrobe and returns the best combinations.

### 3. 📂 Local-First Wardrobe Caching
- **Offline Reliability**: Employs **SQLite** locally for high-performance offline wardrobe queries.
- **Bi-directional Synchronization**: Syncs local database states seamlessly with Supabase databases when connected.

### 4. 🔒 Premium Security & Auth
- **Supabase Authentication**: Integrated secure user authentication, including onboarding screens that capture body shape preferences and styling goals.

---

## 🛠️ Technology Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54) + React Native
- **Backend / BaaS**: [Supabase](https://supabase.com/) (Database, Storage, Auth, and Edge Functions)
- **Local Storage**: `expo-sqlite` (SQLite database engine)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Simple, reactive global stores)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **Image Performance**: `expo-image` (High-performance caching and smooth loading)

---

## 📂 Project Structure

```text
PocketStyle/
├── assets/                  # App icon, splash screen, and design assets
├── supabase/                # Supabase configuration & backend logic
│   ├── functions/           # serverless Edge Functions (Deno / TypeScript)
│   │   ├── analyze-clothing # Vision AI for analyzing clothes from camera
│   │   └── generate-outfit  # AI Engine for generating stylish outfits
│   └── schema.sql           # Database schema definition
├── src/
│   ├── api/                 # Remote API integration layers
│   ├── components/          # Reusable UI elements (Mannequin, Cards, etc.)
│   ├── constants/           # Color palettes, typography & themes
│   ├── database/            # SQLite local database connection & queries
│   ├── engine/              # Outfit generation rules & checks
│   ├── navigation/          # Screen routing & navigator configurations
│   ├── screens/             # Application views (Wardrobe, Studio, Auth)
│   └── store/               # Zustand state stores (Wardrobe, User, Avatar)
├── app.json                 # Expo project configuration
├── App.js                   # Application root
└── package.json             # JS Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/), [Git](https://git-scm.com/), and the [Expo Go](https://expo.dev/client) app installed on your physical device, or an active simulator (Android Studio / Xcode).

### 1. Clone & Install Dependencies

```bash
# Install NPM packages
npm install
```

### 2. Set Up Supabase Backend

1. Create a project on [Supabase](https://supabase.com).
2. Execute the database schema found in `supabase/schema.sql` via the Supabase SQL Editor.
3. Configure your local environment variables in your app configuration:
   - Supabase URL
   - Supabase Anon Key

### 3. Deploy Edge Functions (Optional)

If you are developing or editing the AI outfit generator or wardrobe analyst:

```bash
# Log in to Supabase CLI
npx supabase login

# Deploy functions to your project
npx supabase functions deploy generate-outfit
npx supabase functions deploy analyze-clothing
```

### 4. Run the Application

Start the Expo bundler:

```bash
# Start Metro bundler
npm run start
```

Press **`i`** for iOS Simulator, **`a`** for Android Emulator, or scan the QR code on your phone using the Expo Go app.

---

## 🎨 Theme & Design System

The app utilizes a premium **dark-themed visual interface** designed to look high-end and modern:
- **Core Dark Theme**: Sleek background colors (`#0D0D0D` / `#16161a`) with fine glassmorphism effects.
- **Category-specific Accent Colors**:
  - `Topwear`: `#6C5CE7` (Royal Indigo)
  - `Bottomwear`: `#00CEC9` (Neon Mint)
  - `Footwear`: `#FF7675` (Sunset Salmon)
  - `Accessories`: `#FDCB6E` (Warm Gold)
