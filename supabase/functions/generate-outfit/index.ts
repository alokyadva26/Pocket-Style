import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { occasion, weather } = await req.json();

    // 1. Fetch User Profile
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // 2. Fetch User's Wardrobe
    const { data: wardrobe } = await supabaseClient
      .from("wardrobe_items")
      .select("id, category, clothing_type, color, pattern, fabric, style_categories, season_suitability, image_url")
      .eq("user_id", user.id);

    if (!wardrobe || wardrobe.length === 0) {
      throw new Error("Your wardrobe is empty. Add items first!");
    }

    // 3. Prompt Gemini AI
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `
      You are an expert fashion stylist.
      User Profile: ${JSON.stringify(profile)}
      Requested Occasion: ${occasion}
      Current Weather: ${weather}
      Wardrobe Items: ${JSON.stringify(wardrobe)}

      Select exactly one topwear, one bottomwear, and one footwear from the Wardrobe Items that create a stylish, color-coordinated outfit appropriate for the occasion and weather. You may optionally select one accessory.
      
      Return ONLY a JSON object matching this schema:
      {
        "top_id": "UUID string",
        "bottom_id": "UUID string",
        "footwear_id": "UUID string",
        "accessory_id": "UUID string or null",
        "reason": "Short string explaining why this outfit works based on color, fabric, and user style.",
        "ai_score": integer (0-100)
      }
    `;

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
    
    const geminiResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }),
    });

    if (!geminiResponse.ok) throw new Error("Failed to generate outfit with AI");

    const aiData = await geminiResponse.json();
    const responseText = aiData.candidates[0].content.parts[0].text;
    const aiOutfit = JSON.parse(responseText);

    if (!aiOutfit.top_id || !aiOutfit.bottom_id || !aiOutfit.footwear_id) {
      throw new Error("AI failed to find a complete outfit from your wardrobe.");
    }

    // 4. Save to Database
    const { data: dbOutfit, error: dbError } = await supabaseClient
      .from("outfits")
      .insert({
        user_id: user.id,
        top_id: aiOutfit.top_id,
        bottom_id: aiOutfit.bottom_id,
        footwear_id: aiOutfit.footwear_id,
        accessory_id: aiOutfit.accessory_id,
        ai_score: aiOutfit.ai_score,
        occasion: occasion,
        weather: weather,
        feedback: null
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 5. Populate full item details for the frontend response
    const getFullItem = (id) => wardrobe.find(item => item.id === id) || null;
    const populatedOutfit = {
      id: dbOutfit.id,
      top: getFullItem(dbOutfit.top_id),
      bottom: getFullItem(dbOutfit.bottom_id),
      footwear: getFullItem(dbOutfit.footwear_id),
      accessory: getFullItem(dbOutfit.accessory_id),
      reason: aiOutfit.reason,
      ai_score: aiOutfit.ai_score,
    };

    return new Response(JSON.stringify({ success: true, outfit: populatedOutfit }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
