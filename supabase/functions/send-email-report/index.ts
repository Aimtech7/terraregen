import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    const { email, reportType } = await req.json();

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch latest metrics
    const { data: metrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', user.id);

    // Fetch recent vegetation data
    const { data: vegData } = await supabase
      .from('vegetation_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6);

    // Fetch recent rainfall data
    const { data: rainData } = await supabase
      .from('rainfall_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6);

    const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User';
    
    const emailHtml = `
      <h1>Land Regeneration Report - ${reportType}</h1>
      <p>Hello ${userName},</p>
      <p>Here's your latest land regeneration report:</p>
      
      <h2>Key Metrics</h2>
      <ul>
        ${metrics?.map(m => `<li><strong>${m.metric_type}:</strong> ${m.value} (${m.change})</li>`).join('')}
      </ul>
      
      <h2>Vegetation Health Trend</h2>
      <p>Average NDVI: ${vegData?.[0]?.ndvi || 'N/A'}</p>
      
      <h2>Rainfall Summary</h2>
      <p>Recent rainfall: ${rainData?.[0]?.rainfall_mm || 0} mm</p>
      
      <p>Keep up the great work on your regeneration journey!</p>
      <p>Best regards,<br>Nurture Ground Team</p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Nurture Ground <onboarding@resend.dev>',
      to: [email || user.email!],
      subject: `Your ${reportType} Land Regeneration Report`,
      html: emailHtml,
    });

    if (error) throw error;

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
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