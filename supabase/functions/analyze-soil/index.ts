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
    const { imageData, description } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing soil with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert soil scientist. Analyze soil images and provide detailed insights about soil health, composition, and recommendations for regeneration. Return a JSON response with: ph_estimate, nitrogen_level (low/medium/high), phosphorus_level, potassium_level, organic_matter_estimate, health_score (0-100), and detailed recommendations array.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this soil sample: ${description || 'No additional description provided'}` },
              ...(imageData ? [{ type: 'image_url', image_url: { url: imageData } }] : [])
            ]
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'analyze_soil',
            description: 'Analyze soil composition and health',
            parameters: {
              type: 'object',
              properties: {
                ph_estimate: { type: 'number', description: 'Estimated pH level (0-14)' },
                nitrogen_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                phosphorus_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                potassium_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                organic_matter_estimate: { type: 'number', description: 'Estimated organic matter percentage' },
                health_score: { type: 'number', description: 'Overall health score 0-100' },
                recommendations: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'List of recommendations for soil improvement'
                }
              },
              required: ['ph_estimate', 'nitrogen_level', 'phosphorus_level', 'potassium_level', 'organic_matter_estimate', 'health_score', 'recommendations']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'analyze_soil' } }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error('Failed to analyze soil');
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls[0];
    const analysis = JSON.parse(toolCall.function.arguments);

    console.log('Soil analysis complete:', analysis);

    return new Response(
      JSON.stringify({ success: true, analysis }),
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