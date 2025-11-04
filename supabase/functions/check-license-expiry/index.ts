import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get licenses expiring in 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const { data: expiringLicenses, error: licenseError } = await supabaseClient
      .from('licenses')
      .select('*, license_applications!inner(applicant_name, email)')
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0])

    if (licenseError) throw licenseError

    // Create notifications for expiring licenses
    for (const license of expiringLicenses || []) {
      const daysUntilExpiry = Math.ceil(
        (new Date(license.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      // Check if notification already exists for this license
      const { data: existingNotif } = await supabaseClient
        .from('license_notifications')
        .select('id')
        .eq('license_id', license.id)
        .eq('notification_type', 'expiry_warning')
        .single()

      if (!existingNotif) {
        await supabaseClient
          .from('license_notifications')
          .insert({
            license_id: license.id,
            user_id: license.user_id,
            notification_type: 'expiry_warning',
            message: `Your license (${license.license_number}) will expire in ${daysUntilExpiry} days. Please renew before ${new Date(license.expiry_date).toLocaleDateString()}.`,
          })

        console.log(`Created expiry notification for license ${license.license_number}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: expiringLicenses?.length || 0,
        message: 'License expiry check completed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
