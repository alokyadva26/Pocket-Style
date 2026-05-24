import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// CORS Headers for browser/React Native compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Ensure the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get the image URL passed from the React Native app
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      throw new Error("imageUrl is required");
    }

    // Fetch the image and convert it to Base64 for Gemini
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image from Storage");
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Data = encodeBase64(arrayBuffer);
    
    // Determine mime type (fallback to jpeg)
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Call Google Gemini 1.5 Flash (Fast, Cheap, Excellent Vision)
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `You are a fashion AI assistant. Analyze the clothing item in this image.
    Return ONLY a valid JSON object matching this exact structure:
    {
      "category": "string (one of: topwear, bottomwear, footwear, accessory)",
      "clothing_type": "string (e.g. hoodie, jeans, sneakers, sunglasses)",
      "color": ["string (primary color)", "string (secondary color, optional)"],
      "pattern": "string (e.g. solid, striped, floral, plaid, none)",
      "fabric": "string (e.g. cotton, denim, leather, knit, synthetic)",
      "style_categories": ["string (e.g. casual, formal, streetwear, athletic)"],
      "gender_category": "string (e.g. male, female, unisex)",
      "season_suitability": ["string (e.g. summer, winter, fall, spring)"]
    }`;

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
    
    const geminiResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: contentType,
                  data: base64Data
                }
              }
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      let modelsList = "Could not fetch models.";
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey.trim()}`);
        const listData = await listRes.json();
        modelsList = listData.models.map((m: any) => m.name).join(", ");
      } catch (e) {}
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini API Error: ${errorText} | Available models: ${modelsList}`);
    }

    const aiData = await geminiResponse.json();
    const responseText = aiData.candidates[0].content.parts[0].text;
    const aiAnalysis = JSON.parse(responseText);

    // Save the analyzed item to the Supabase database
    const { data: dbItem, error: dbError } = await supabaseClient
      .from("wardrobe_items")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        category: aiAnalysis.category,
        clothing_type: aiAnalysis.clothing_type,
        color: aiAnalysis.color,
        pattern: aiAnalysis.pattern,
        fabric: aiAnalysis.fabric,
        style_categories: aiAnalysis.style_categories,
        gender_category: aiAnalysis.gender_category,
        season_suitability: aiAnalysis.season_suitability,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true, item: dbItem }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
