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

    // Get user's county from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('location')
      .eq('id', user.id)
      .single();

    let countyName = profile?.location || 'Nairobi';
    
    // Find matching county in kenya_counties
    const { data: county } = await supabase
      .from('kenya_counties')
      .select('*')
      .ilike('name', `%${countyName}%`)
      .single();

    if (!county) {
      throw new Error(`County ${countyName} not found in database`);
    }

    console.log(`Fetching data for ${county.name} county`);

    // Get coordinates for the county (using OpenStreetMap Nominatim)
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(county.name + ', Kenya')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'TerraRegen/1.0' } }
    );
    const geoData = await geoResponse.json();
    
    if (!geoData || geoData.length === 0) {
      throw new Error('Could not geocode county');
    }

    const lat = parseFloat(geoData[0].lat);
    const lng = parseFloat(geoData[0].lon);

    // Fetch weather data from Open-Meteo (30 days historical + 7 days forecast)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,windspeed_10m_max&start_date=${startDate}&end_date=${endDate}&timezone=Africa/Nairobi`;
    
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // Store local weather data
    if (weatherData.daily) {
      const weatherRecords = weatherData.daily.time.map((date: string, i: number) => ({
        county_id: county.id,
        date,
        temperature_max: weatherData.daily.temperature_2m_max[i],
        temperature_min: weatherData.daily.temperature_2m_min[i],
        precipitation_mm: weatherData.daily.precipitation_sum[i],
        humidity_percent: weatherData.daily.relative_humidity_2m_mean[i],
        wind_speed_kmh: weatherData.daily.windspeed_10m_max[i],
        source: 'open-meteo'
      }));

      await supabase
        .from('local_weather_data')
        .upsert(weatherRecords, { 
          onConflict: 'county_id,date,source',
          ignoreDuplicates: false 
        });
    }

    // Get planting calendar for this county
    const { data: plantingCalendar } = await supabase
      .from('planting_calendars')
      .select('*')
      .eq('county_id', county.id);

    // Calculate current season based on month
    const currentMonth = new Date().getMonth() + 1;
    let currentSeason = 'off-season';
    
    if (county.rainfall_pattern === 'bimodal') {
      // Long rains: March-May, Short rains: October-December
      if (currentMonth >= 3 && currentMonth <= 5) {
        currentSeason = 'long_rains';
      } else if (currentMonth >= 10 && currentMonth <= 12) {
        currentSeason = 'short_rains';
      }
    } else if (county.rainfall_pattern === 'unimodal') {
      // Single rainy season: April-October
      if (currentMonth >= 4 && currentMonth <= 10) {
        currentSeason = 'main_season';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        county: {
          name: county.name,
          agroEcologicalZone: county.agro_ecological_zone,
          rainfallPattern: county.rainfall_pattern,
          currentSeason,
          longRains: county.long_rains_start && county.long_rains_end 
            ? `${county.long_rains_start} - ${county.long_rains_end}`
            : null,
          shortRains: county.short_rains_start && county.short_rains_end
            ? `${county.short_rains_start} - ${county.short_rains_end}`
            : null,
          averageRainfall: county.average_rainfall_mm
        },
        plantingCalendar,
        weatherDataStored: weatherData.daily?.time.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
