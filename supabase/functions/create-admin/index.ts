import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import bcrypt from "https://esm.sh/bcryptjs";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-api-key',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PATCH'
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, serviceKey)

        const adminKey = req.headers.get('x-admin-api-key')
        const expectedKey = Deno.env.get('ADMIN_API_KEY')

        if (!adminKey || adminKey !== expectedKey) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid API Key' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401
            })
        }

        // --- GET: List Admins ---
        if (req.method === 'GET') {
            const { data: admins, error } = await supabase
                .from('admins')
                .select('id, email, full_name, role, created_at, is_blocked, permissions')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return new Response(JSON.stringify(admins), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // --- POST: Create Admin ---
        if (req.method === 'POST') {
            const body = await req.json()
            const email = (body.email || '').trim().toLowerCase()
            const password = (body.password || '').trim()
            const role = body.role
            const fullName = body.fullName
            const permissions = body.permissions

            if (!email || !password || !role || !fullName) {
                return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400
                })
            }

            // Check existing
            const { data: existing } = await supabase.from('admins').select('id').eq('email', email).single();
            if (existing) {
                return new Response(JSON.stringify({ error: 'Admin email already exists' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400
                })
            }

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            // Default permissions if not provided
            const finalPermissions = permissions || {
                manageUsers: role === 'super_admin',
                manageContent: true,
                manageBundles: role === 'super_admin',
                manageTests: true,
                manageQuestions: true,
                viewAnalytics: true,
                manageSettings: role === 'super_admin'
            };

            const { data: newAdmin, error: insertError } = await supabase
                .from('admins')
                .insert({
                    email,
                    password_hash: hash,
                    role,
                    full_name: fullName,
                    permissions: finalPermissions,
                    is_blocked: false
                })
                .select()
                .single();

            if (insertError) throw insertError;

            return new Response(JSON.stringify({
                message: 'Admin created successfully',
                userId: newAdmin.id
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // --- PATCH: Update Admin ---
        if (req.method === 'PATCH') {
            const { id, ...updates } = await req.json()
            console.log(`Updating admin ${id} with:`, JSON.stringify(updates));

            if (!id) {
                return new Response(JSON.stringify({ error: 'Missing admin ID' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
            }

            // If updating password, hash it
            if (updates.password) {
                const salt = bcrypt.genSaltSync(10);
                updates.password_hash = bcrypt.hashSync(updates.password, salt);
                delete updates.password;
            }

            const { error: updateError } = await supabase
                .from('admins')
                .update(updates)
                .eq('id', id);

            if (updateError) throw updateError;

            return new Response(JSON.stringify({ message: 'Admin updated successfully' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // --- DELETE: Remove Admin ---
        if (req.method === 'DELETE') {
            const url = new URL(req.url);
            const id = url.searchParams.get('id');

            if (!id) {
                return new Response(JSON.stringify({ error: 'Missing admin ID' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
            }

            const { error: deleteError } = await supabase.from('admins').delete().eq('id', id);
            if (deleteError) throw deleteError;

            return new Response(JSON.stringify({ message: 'Admin deleted' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405
        })

    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})
