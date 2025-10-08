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

    const { areaHectares, landType, startDate, endDate } = await req.json();

    // Fetch vegetation data for the period
    const { data: vegData } = await supabase
      .from('vegetation_data')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (!vegData || vegData.length === 0) {
      throw new Error('No vegetation data available for calculation');
    }

    // Calculate carbon sequestration based on NDVI improvement
    const firstNDVI = parseFloat(vegData[0].ndvi);
    const lastNDVI = parseFloat(vegData[vegData.length - 1].ndvi);
    const ndviImprovement = lastNDVI - firstNDVI;

    // Simplified carbon calculation
    // Typical values: 2-5 tons CO2/ha/year for regenerative practices
    const baseSequestration = 3.5; // tons CO2/ha/year
    const improvementFactor = Math.max(0, ndviImprovement * 10); // Scale NDVI to factor
    const carbonSequestered = areaHectares * (baseSequestration + improvementFactor);

    // Calculate credit value (simplified - actual market rates vary)
    const pricePerTon = 15; // USD per ton CO2
    const creditValue = carbonSequestered * pricePerTon;

    // Store in database
    const { data: carbonCredit, error } = await supabase
      .from('carbon_credits')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        carbon_sequestered_tons: carbonSequestered,
        area_hectares: areaHectares,
        credit_value_usd: creditValue,
        status: 'calculated'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Carbon calculation complete:', carbonCredit);

    return new Response(
      JSON.stringify({ success: true, carbonCredit }),
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