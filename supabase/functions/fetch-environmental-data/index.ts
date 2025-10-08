import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  id: string;
  location: string;
  land_size_hectares: number;
}

interface OpenMeteoResponse {
  daily: {
    time: string[];
    precipitation_sum: number[];
    temperature_2m_mean: number[];
  };
}

interface NASAPowerResponse {
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: { [key: string]: number };
      PRECTOTCORR: { [key: string]: number };
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting environmental data fetch...');

    // Fetch all users with location data
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, location, land_size_hectares')
      .not('location', 'is', null);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles with location data found');
      return new Response(
        JSON.stringify({ message: 'No profiles with location data found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${profiles.length} profiles to process`);

    // Process each user
    for (const profile of profiles as UserProfile[]) {
      try {
        console.log(`Processing user ${profile.id} at location: ${profile.location}`);
        
        // Parse location (assuming format: "lat,lng" or city name)
        const coords = await getCoordinates(profile.location);
        
        if (!coords) {
          console.log(`Skipping user ${profile.id}: Invalid location format`);
          continue;
        }

        // Fetch weather data from Open-Meteo
        const weatherData = await fetchOpenMeteo(coords.lat, coords.lng);
        
        // Fetch NASA POWER data for vegetation indices
        const nasaData = await fetchNASAPower(coords.lat, coords.lng);

        // Process and store rainfall data
        await storeRainfallData(supabase, profile.id, weatherData);

        // Process and store vegetation data
        await storeVegetationData(supabase, profile.id, nasaData);

        // Calculate and store metrics
        await calculateMetrics(supabase, profile.id, weatherData, nasaData);

        console.log(`Successfully processed user ${profile.id}`);
      } catch (error) {
        console.error(`Error processing user ${profile.id}:`, error);
        // Continue with next user
      }
    }

    return new Response(
      JSON.stringify({ message: 'Environmental data fetch completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in fetch-environmental-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function getCoordinates(location: string): Promise<{ lat: number; lng: number } | null> {
  // Check if location is already in lat,lng format
  const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
  }

  // Otherwise, use geocoding API
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'RegenAgro/1.0' } }
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}

async function fetchOpenMeteo(lat: number, lng: number): Promise<OpenMeteoResponse> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,temperature_2m_mean&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&timezone=auto`;
  
  console.log(`Fetching Open-Meteo data from: ${url}`);
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.daily) {
    console.error('Open-Meteo API error:', data);
    throw new Error('Failed to fetch weather data from Open-Meteo');
  }
  
  console.log(`Received ${data.daily.time.length} days of weather data`);
  return data;
}

async function fetchNASAPower(lat: number, lng: number): Promise<NASAPowerResponse> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
  const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,PRECTOTCORR&community=AG&longitude=${lng}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data;
}

async function storeRainfallData(supabase: any, userId: string, weatherData: OpenMeteoResponse) {
  if (!weatherData.daily || !weatherData.daily.time) {
    console.error('Invalid weather data structure:', weatherData);
    throw new Error('Weather data is missing or invalid');
  }

  // Aggregate rainfall by month
  const monthlyRainfall: { [key: string]: number[] } = {};
  
  weatherData.daily.time.forEach((date, index) => {
    const month = date.substring(0, 7); // YYYY-MM
    if (!monthlyRainfall[month]) {
      monthlyRainfall[month] = [];
    }
    monthlyRainfall[month].push(weatherData.daily.precipitation_sum[index]);
  });

  // Calculate monthly totals and insert
  for (const [month, values] of Object.entries(monthlyRainfall)) {
    const totalRainfall = values.reduce((sum, val) => sum + val, 0);
    
    const { error } = await supabase
      .from('rainfall_data')
      .upsert({
        user_id: userId,
        month,
        rainfall_mm: totalRainfall,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,month',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Error storing rainfall data for ${month}:`, error);
    }
  }
}

async function storeVegetationData(supabase: any, userId: string, nasaData: NASAPowerResponse) {
  // Calculate NDVI proxy from solar radiation and precipitation
  const solarData = nasaData.properties.parameter.ALLSKY_SFC_SW_DWN;
  const precipData = nasaData.properties.parameter.PRECTOTCORR;
  
  // Aggregate by month
  const monthlyVeg: { [key: string]: { solar: number[]; precip: number[] } } = {};
  
  for (const [date, solar] of Object.entries(solarData)) {
    const month = date.substring(0, 6); // YYYYMM
    const formattedMonth = `${month.substring(0, 4)}-${month.substring(4, 6)}`;
    
    if (!monthlyVeg[formattedMonth]) {
      monthlyVeg[formattedMonth] = { solar: [], precip: [] };
    }
    monthlyVeg[formattedMonth].solar.push(solar);
    monthlyVeg[formattedMonth].precip.push(precipData[date]);
  }

  // Calculate monthly NDVI approximation
  for (const [month, data] of Object.entries(monthlyVeg)) {
    const avgSolar = data.solar.reduce((sum, val) => sum + val, 0) / data.solar.length;
    const avgPrecip = data.precip.reduce((sum, val) => sum + val, 0) / data.precip.length;
    
    // Simple NDVI proxy: normalized combination of solar radiation and precipitation
    const ndvi = Math.min(0.9, Math.max(0.1, (avgPrecip * 0.01 + avgSolar * 0.001) / 10));
    
    const { error } = await supabase
      .from('vegetation_data')
      .upsert({
        user_id: userId,
        month,
        ndvi,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,month',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Error storing vegetation data for ${month}:`, error);
    }
  }
}

async function calculateMetrics(supabase: any, userId: string, weatherData: OpenMeteoResponse, nasaData: NASAPowerResponse) {
  // Calculate recent averages
  const recentPrecip = weatherData.daily.precipitation_sum.slice(-30);
  const avgPrecip = recentPrecip.reduce((sum, val) => sum + val, 0) / recentPrecip.length;
  
  const recentTemp = weatherData.daily.temperature_2m_mean.slice(-30);
  const avgTemp = recentTemp.reduce((sum, val) => sum + val, 0) / recentTemp.length;

  // Calculate trends (comparing recent 30 days to previous 30 days)
  const prevPrecip = weatherData.daily.precipitation_sum.slice(-60, -30);
  const prevAvgPrecip = prevPrecip.reduce((sum, val) => sum + val, 0) / prevPrecip.length;
  
  const moistureTrend = avgPrecip > prevAvgPrecip ? 'up' : 'down';
  const moistureChange = `${Math.abs(((avgPrecip - prevAvgPrecip) / prevAvgPrecip) * 100).toFixed(1)}%`;

  // Store Soil Moisture metric
  await supabase.from('metrics').upsert({
    user_id: userId,
    metric_type: 'Soil Moisture',
    value: `${avgPrecip.toFixed(1)}mm`,
    change: moistureChange,
    trend: moistureTrend,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id,metric_type',
    ignoreDuplicates: false
  });

  // Calculate erosion risk based on heavy rainfall events
  const heavyRainDays = recentPrecip.filter(p => p > 20).length;
  const erosionRisk = heavyRainDays > 5 ? 'High' : heavyRainDays > 2 ? 'Medium' : 'Low';
  
  await supabase.from('metrics').upsert({
    user_id: userId,
    metric_type: 'Erosion Risk',
    value: erosionRisk,
    change: `${heavyRainDays} events`,
    trend: heavyRainDays > 5 ? 'up' : 'down',
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id,metric_type',
    ignoreDuplicates: false
  });

  console.log(`Calculated and stored metrics for user ${userId}`);
}
