import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-api-key',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || ''

        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false }
        })

        const adminKey = req.headers.get('x-admin-api-key')
        const expectedKey = Deno.env.get('ADMIN_API_KEY')

        if (!adminKey || adminKey !== expectedKey) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid API Key' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401
            })
        }

        const { email, password, fullName, role } = await req.json()
        if (!email || !password || !fullName || !role) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            })
        }

        console.log(`[RBAC_SYNC]: Creating ${role} account for ${email}`)

        // 1. Create User via Admin API
        // We set 'role' in both user_metadata (for the trigger) and app_metadata (optional backup)
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role // The trigger 'on_auth_user_created' uses this
            },
            app_metadata: {
                role: role // Redundancy
            }
        })

        if (createError) {
            console.error('[CREATE_ERROR]:', createError)
            return new Response(JSON.stringify({ error: createError.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            })
        }

        // Note: The handle_new_user trigger now automatically handles the profile insertion 
        // and metadata syncing. We don't need manual profile upsert here anymore.

        return new Response(JSON.stringify({
            message: 'Success',
            userId: userData.user.id,
            note: 'Profile created automatically via DB trigger'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (err: any) {
        console.error(`[FATAL_ERROR]:`, err)
        return new Response(
            JSON.stringify({ error: err.message || 'Internal Server Error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
