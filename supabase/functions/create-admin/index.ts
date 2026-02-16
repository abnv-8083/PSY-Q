import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
            process.env.SUPABASE_URL ?? '',
            process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // 1. Get user who called the function
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('No authorization header')

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        )
        if (authError || !user) throw new Error('Invalid token')

        // 2. Verify they are a superadmin in the profiles table
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !['superadmin', 'super_admin'].includes(profile.role)) {
            throw new Error('Unauthorized: Only Super Admins can create new admins')
        }

        // 3. Get request body
        const { email, fullName } = await req.json()
        if (!email || !fullName) throw new Error('Email and Full Name are required')

        // 4. Invite user via Supabase Auth Admin API
        const { data: inviteData, error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(
            email,
            { data: { full_name: fullName } }
        )
        if (inviteError) throw inviteError

        // 5. Update their role in the profiles table
        // Note: Profiles are usually created via a trigger on auth.users insert.
        // If not, we might need to upsert here or wait for the join.
        // We'll upsert to be safe.
        const { error: roleError } = await supabaseClient
            .from('profiles')
            .upsert({
                id: inviteData.user.id,
                email: email,
                full_name: fullName,
                role: 'admin'
            })

        if (roleError) throw roleError

        // 6. Return success
        return new Response(
            JSON.stringify({ message: 'Admin invited successfully', user: inviteData.user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
