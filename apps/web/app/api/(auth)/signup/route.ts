import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, fullName } = body
        console.log('Signup attempt for:', email)

        const supabase = await createClient()
        const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        console.log('Using Supabase Project:', projectUrl)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${new URL(req.url).origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('Supabase signup error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        console.log('Signup successful!')
        console.log('User ID:', data.user?.id)
        console.log('User Email:', data.user?.email)
        console.log('Confirmation Sent to:', data.user?.email)

        return NextResponse.json({ message: 'Check your email for confirmation!', user: data.user })
    } catch (err: any) {
        console.error('API Route Error:', err.message)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}