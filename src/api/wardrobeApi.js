import { supabase } from '../../lib/supabase';
import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as Crypto from 'expo-crypto';

/**
 * Uploads a local image URI to Supabase Storage
 * @param {string} uri - The local file URI (from expo-image-picker)
 * @param {string} userId - The current user's ID (for organization)
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export async function uploadImageToSupabase(uri, userId) {
  try {
    // 1. Read the image as base64 using the modern File API
    const file = new File(uri);
    const base64 = await file.readAsString({
      encoding: 'base64',
    });
    
    // 2. Generate a unique filename
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Crypto.randomUUID()}.${fileExt}`;

    // 3. Upload to the 'wardrobe' bucket
    const { data, error } = await supabase.storage
      .from('wardrobe')
      .upload(fileName, decode(base64), {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
      });

    if (error) throw error;

    // 4. Get the public URL
    const { data: publicData } = supabase.storage
      .from('wardrobe')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw new Error(`Upload Failed: ${error.message || 'Please try again.'}`);
  }
}

/**
 * Triggers the AI Edge Function to analyze an uploaded image
 * and automatically save the metadata to the wardrobe_items table.
 * @param {string} imageUrl - The public URL of the uploaded image
 * @returns {Promise<Object>} - The analyzed and saved wardrobe item
 */
export async function analyzeClothingItem(imageUrl) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-clothing', {
      body: { imageUrl },
    });

    if (error) {
      console.error('Functions Invoke Error Context:', error);
      throw new Error(error.message || 'Edge Function Error');
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to analyze clothing');
    }

    return data.item;
  } catch (error) {
    console.error('Error invoking analyze-clothing function:', error);
    // Try to get the deepest error message
    throw new Error(`AI Analysis Failed: ${error.message}`);
  }
}
