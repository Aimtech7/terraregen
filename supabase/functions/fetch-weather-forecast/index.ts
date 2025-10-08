import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenMeteoForecast {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    relative_humidity_2m_mean: number[];
  };
}

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

    // Get user location from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('location')
      .eq('id', user.id)
      .single();

    if (!profile?.location) {
      throw new Error('User location not set');
    }

    // Parse location (could be "lat,lng" or city name)
    let lat: number, lng: number;
    
    if (profile.location.includes(',')) {
      [lat, lng] = profile.location.split(',').map(parseFloat);
    } else {
      // Geocode location using Nominatim
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(profile.location)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'NurtureGround/1.0' } }
      );
      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        throw new Error('Location not found');
      }
      lat = parseFloat(geoData[0].lat);
      lng = parseFloat(geoData[0].lon);
    }

    console.log(`Fetching weather forecast for: ${lat}, ${lng}`);

    // Fetch 7-day forecast from Open-Meteo
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_mean&timezone=auto`;
    
    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch weather forecast');
    }

    const forecast: OpenMeteoForecast = await response.json();

    // Store forecast in database
    const forecastRecords = forecast.daily.time.map((date, i) => ({
      user_id: user.id,
      forecast_date: date,
      temperature_high: forecast.daily.temperature_2m_max[i],
      temperature_low: forecast.daily.temperature_2m_min[i],
      precipitation_mm: forecast.daily.precipitation_sum[i],
      humidity_percent: forecast.daily.relative_humidity_2m_mean[i],
      wind_speed_kmh: forecast.daily.windspeed_10m_max[i],
      conditions: forecast.daily.precipitation_sum[i] > 10 ? 'Rainy' : 
                  forecast.daily.precipitation_sum[i] > 0 ? 'Partly Cloudy' : 'Sunny'
    }));

    // Upsert forecast data
    const { error } = await supabase
      .from('weather_forecasts')
      .upsert(forecastRecords, { 
        onConflict: 'user_id,forecast_date',
        ignoreDuplicates: false 
      });

    if (error) throw error;

    console.log(`Stored ${forecastRecords.length} days of forecast data`);

    return new Response(
      JSON.stringify({ success: true, forecast: forecastRecords }),
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