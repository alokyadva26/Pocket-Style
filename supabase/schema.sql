-- =================================================================================
-- PocketStylist Supabase Schema Migration (Phase 1 & 2)
-- =================================================================================

-- 1. Users Profile & Preferences
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  gender VARCHAR(50),
  height_cm INT,
  body_type VARCHAR(50),
  skin_tone VARCHAR(50),
  preferred_styles TEXT[],
  favorite_colors TEXT[],
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure Row Level Security (RLS) for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Wardrobe Items (Enriched by AI)
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category VARCHAR(50),       -- topwear, bottomwear, footwear, accessory
  clothing_type VARCHAR(50),  -- hoodie, jeans, sneakers
  color TEXT[],
  pattern VARCHAR(50),
  fabric VARCHAR(50),
  style_categories TEXT[],
  gender_category VARCHAR(50),
  season_suitability TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wardrobe" ON public.wardrobe_items FOR ALL USING (auth.uid() = user_id);

-- 3. AI Generated Outfits
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  top_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  bottom_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  footwear_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  accessory_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  ai_score INT,
  occasion VARCHAR(50),
  weather VARCHAR(50),
  feedback VARCHAR(20),       -- 'liked', 'disliked'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own outfits" ON public.outfits FOR ALL USING (auth.uid() = user_id);

-- 4. User Avatars
CREATE TABLE IF NOT EXISTS public.avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  avatar_image_url TEXT,
  face_shape VARCHAR(50),
  hairstyle VARCHAR(50),
  base_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own avatar" ON public.avatars FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for Wardrobe Images (execute via Dashboard or API if not existing)
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe', 'wardrobe', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Users can upload their own wardrobe images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view wardrobe images" ON storage.objects FOR SELECT USING (bucket_id = 'wardrobe');
