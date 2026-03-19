import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const { email, password } = await req.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    return NextResponse.json({ user: data.user })
}