import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { cropName, soilType, countyId } = await req.json();

    if (!cropName) {
      throw new Error('Crop name is required');
    }

    // Get county information
    const { data: county } = await supabase
      .from('kenya_counties')
      .select('*')
      .eq('id', countyId)
      .single();

    // Get recent weather data for the county
    const { data: weatherData } = await supabase
      .from('local_weather_data')
      .select('*')
      .eq('county_id', countyId)
      .order('date', { ascending: false })
      .limit(30);

    // Get planting calendar for this crop and county
    const { data: plantingCalendar } = await supabase
      .from('planting_calendars')
      .select('*')
      .eq('county_id', countyId)
      .ilike('crop_name', cropName)
      .limit(1);

    // Get recent soil analysis if available
    const { data: soilAnalysis } = await supabase
      .from('soil_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Calculate average precipitation and temperature
    const avgPrecip = weatherData && weatherData.length > 0
      ? weatherData.reduce((sum, d) => sum + (d.precipitation_mm || 0), 0) / weatherData.length
      : 0;
    const avgTempMax = weatherData && weatherData.length > 0
      ? weatherData.reduce((sum, d) => sum + (d.temperature_max || 0), 0) / weatherData.length
      : 0;

    const prompt = `You are an agricultural expert specializing in Kenyan farming conditions. Generate comprehensive crop insights for the following:

Crop: ${cropName}
County: ${county?.name || 'Unknown'}
Agro-Ecological Zone: ${county?.agro_ecological_zone || 'Unknown'}
Rainfall Pattern: ${county?.rainfall_pattern || 'Unknown'}
Soil Type: ${soilType || 'Not specified'}

Recent Weather (last 30 days):
- Average Precipitation: ${avgPrecip.toFixed(1)}mm
- Average Max Temperature: ${avgTempMax.toFixed(1)}°C

${plantingCalendar && plantingCalendar.length > 0 ? `
Planting Calendar:
- Season: ${plantingCalendar[0].season}
- Planting Window: ${plantingCalendar[0].planting_window_start} - ${plantingCalendar[0].planting_window_end}
- Water Requirements: ${plantingCalendar[0].water_requirements}
- Recommended Soil pH: ${plantingCalendar[0].recommended_soil_ph_min} - ${plantingCalendar[0].recommended_soil_ph_max}
` : ''}

${soilAnalysis && soilAnalysis.length > 0 ? `
Recent Soil Analysis:
- pH Level: ${soilAnalysis[0].ph_level}
- Nitrogen: ${soilAnalysis[0].nitrogen_level}
- Phosphorus: ${soilAnalysis[0].phosphorus_level}
- Potassium: ${soilAnalysis[0].potassium_level}
- Organic Matter: ${soilAnalysis[0].organic_matter_percent}%
` : ''}

Provide specific insights for this crop in this Kenyan context including:
1. Climate adaptation strategies for this agro-ecological zone
2. Fertilizer recommendations (NPK ratios and timing) suited for African soils
3. Common pest and disease alerts specific to Kenya
4. Market insights and best practices for Kenyan farmers

Return your response as a JSON object with these fields:
{
  "climateAdaptationNotes": "string",
  "fertilizerRecommendations": {
    "npkRatio": "string",
    "applicationTiming": "string",
    "organicAlternatives": "string"
  },
  "pestDiseaseAlerts": {
    "commonPests": ["array of pests"],
    "commonDiseases": ["array of diseases"],
    "preventiveMeasures": ["array of measures"]
  },
  "marketInsights": {
    "bestSellingPeriods": "string",
    "storageAdvice": "string",
    "valueAdditionTips": "string"
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert agricultural advisor specializing in Kenyan farming practices. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const insights = JSON.parse(aiData.choices[0].message.content);

    // Store the insights in the database
    const { data: storedInsight, error: storeError } = await supabase
      .from('crop_insights')
      .insert({
        user_id: user.id,
        county_id: countyId,
        crop_name: cropName,
        soil_type: soilType,
        climate_adaptation_notes: insights.climateAdaptationNotes,
        fertilizer_recommendations: insights.fertilizerRecommendations,
        pest_disease_alerts: insights.pestDiseaseAlerts,
        market_insights: insights.marketInsights
      })
      .select()
      .single();

    if (storeError) throw storeError;

    return new Response(
      JSON.stringify({ success: true, insights: storedInsight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating crop insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
