import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const { email, password, fullName } = await req.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName, // This matches ->>'full_name' in the SQL trigger
            },
        },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Check your email for confirmation!', user: data.user })
}