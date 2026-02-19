import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import bcrypt from "https://esm.sh/bcryptjs";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, serviceKey)

        const { action, ...payload } = await req.json()

        // --- STUDENT SIGNUP ---
        console.log(`[Action] ${action}`, payload)

        // --- STUDENT SIGNUP ---
        if (action === 'student-signup') {
            const { email, password, fullName, full_name, phone } = payload
            const finalFullName = fullName || full_name

            // Check if email exists
            const { data: existing } = await supabase
                .from('students')
                .select('id')
                .eq('email', email)
                .maybeSingle()

            if (existing) {
                return new Response(JSON.stringify({ error: 'Email already registered' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400
                })
            }

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            const otp = payload.otp || Math.floor(100000 + Math.random() * 900000).toString();

            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

            const { error: insertError } = await supabase
                .from('students')
                .insert({
                    email,
                    password_hash: hash,
                    full_name: finalFullName,
                    phone,
                    otp_code: otp,
                    otp_expires_at: expiresAt,
                    is_verified: false
                })

            if (insertError) throw insertError

            // TODO: Send OTP via Email (using simple console log for now as placeholder for EmailJS/SMTP)
            console.log(`[OTP] Sent to ${email}: ${otp}`)

            return new Response(JSON.stringify({ message: 'OTP sent to email' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // --- STUDENT VERIFY OTP ---
        if (action === 'student-verify') {
            const { email, otp } = payload

            const { data: student, error: fetchError } = await supabase
                .from('students')
                .select('*')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle()

            if (fetchError) throw fetchError
            if (!student) {
                return new Response(JSON.stringify({ error: `User not found for email: ${email}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
            }

            const cleanOtp = otp.trim()
            const isExpired = new Date() > new Date(student.otp_expires_at)

            if (student.otp_code !== cleanOtp) {
                return new Response(JSON.stringify({ error: 'Invalid verification code. Please check your email and try again.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
            }

            if (isExpired) {
                return new Response(JSON.stringify({ error: 'Verification code has expired. Please sign up again to receive a new code.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
            }

            // Activate user
            await supabase.from('students').update({ is_verified: true, otp_code: null, otp_expires_at: null }).eq('id', student.id)

            return new Response(JSON.stringify({
                user: { id: student.id, email: student.email, full_name: student.full_name, role: 'student' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }


        // --- STUDENT LOGIN ---
        if (action === 'student-login') {
            const { email, password } = payload

            const { data: student } = await supabase
                .from('students')
                .select('*')
                .eq('email', email)
                .single()

            if (!student) {
                // Specific error as requested
                return new Response(JSON.stringify({ error: 'Create Account' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 404 // Not found
                })
            }

            if (!student.is_verified) {
                return new Response(JSON.stringify({ error: 'Email not verified' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 })
            }


            const match = bcrypt.compareSync(password, student.password_hash);
            if (!match) {
                return new Response(JSON.stringify({ error: 'Invalid Password' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
            }

            return new Response(JSON.stringify({
                user: { id: student.id, email: student.email, full_name: student.full_name, role: 'student' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // --- ADMIN LOGIN ---
        if (action === 'admin-login') {
            const email = (payload.email || '').trim().toLowerCase()
            const password = (payload.password || '').trim()

            const { data: admin } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email)
                .single()

            if (!admin) {
                return new Response(JSON.stringify({ error: 'Admin Not Found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 })
            }

            const match = bcrypt.compareSync(password, admin.password_hash);
            if (!match) {
                return new Response(JSON.stringify({ error: 'Incorrect Password' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
            }

            if (admin.is_blocked) {
                return new Response(JSON.stringify({ error: 'Your account has been suspended' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 })
            }

            return new Response(JSON.stringify({
                user: {
                    id: admin.id,
                    email: admin.email,
                    role: admin.role,
                    is_admin: true,
                    full_name: admin.full_name,
                    permissions: admin.permissions || {}
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // --- FORGOT PASSWORD (Student) ---
        if (action === 'student-forgot-password') {
            const { email } = payload
            const { data: student } = await supabase.from('students').select('id').eq('email', email).single()

            if (!student) {
                return new Response(JSON.stringify({ error: 'Invalid Email ID' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 })
            }

            // Generate token
            const resetToken = Math.random().toString(36).substring(2, 15)
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

            await supabase.from('students').update({ otp_code: resetToken, otp_expires_at: expiresAt }).eq('id', student.id)

            // TODO: Email this token link
            console.log(`[RESET] Link for ${email}: /reset-password?token=${resetToken}&email=${email}`)

            return new Response(JSON.stringify({ message: 'Reset link sent' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        // --- RESET PASSWORD (Student) ---
        if (action === 'student-reset-password') {
            const { email, token, newPassword } = payload
            const { data: student } = await supabase.from('students').select('*').eq('email', email).single()

            if (!student || student.otp_code !== token || new Date() > new Date(student.otp_expires_at)) {
                return new Response(JSON.stringify({ error: 'Invalid or expired link' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
            }

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newPassword, salt);
            await supabase.from('students').update({ password_hash: hash, otp_code: null, otp_expires_at: null }).eq('id', student.id)

            return new Response(JSON.stringify({ message: 'Password updated' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        // --- ADMIN RESET PASSWORD REQUEST ---
        if (action === 'admin-reset-password-request') {
            const email = (payload.email || '').trim().toLowerCase()
            const { data: admin } = await supabase.from('admins').select('id').eq('email', email).maybeSingle()

            if (!admin) {
                return new Response(JSON.stringify({ error: 'Admin Not Found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 })
            }

            const resetToken = crypto.randomUUID().replace(/-/g, '')
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

            const { error: updateError } = await supabase
                .from('admins')
                .update({ reset_token: resetToken, reset_expires_at: expiresAt })
                .eq('id', admin.id)

            if (updateError) throw updateError

            return new Response(JSON.stringify({ token: resetToken }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        // --- ADMIN RESET PASSWORD CONFIRM ---
        if (action === 'admin-reset-password-confirm') {
            const { email, token, newPassword } = payload
            const { data: admin } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle()

            if (!admin || admin.reset_token !== token || new Date() > new Date(admin.reset_expires_at)) {
                return new Response(JSON.stringify({ error: 'Invalid or expired reset link' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
            }

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newPassword, salt);
            const { error: updateError } = await supabase
                .from('admins')
                .update({ password_hash: hash, reset_token: null, reset_expires_at: null })
                .eq('id', admin.id)

            if (updateError) throw updateError

            return new Response(JSON.stringify({ message: 'Password updated successfully' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })

    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }
})
