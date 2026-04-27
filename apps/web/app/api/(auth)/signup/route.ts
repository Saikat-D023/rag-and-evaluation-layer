import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, fullName } = body
        console.log('Signup attempt for:', email)

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoConfirm: true,
                    persistSession: false
                }
            }
        )

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
            }
        });

        if (error) {
            console.error('Supabase signup error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        if (data.user) {
            try {
                await db.insert(profiles).values({
                    id: data.user.id,
                    fullName: fullName,
                });
                console.log('Profile created for user:', data.user.id);
            } catch (dbError: unknown) {
                const error = dbError as { message?: string };
                console.error('Failed to create profile:', error.message);
                // We don't return error here because the user IS created in Supabase
            }
        }

        console.log('Signup successful (auto-confirmed)!')
        return NextResponse.json({ message: 'Signup successful!', user: data.user })
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('API Route Error:', error.message)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}