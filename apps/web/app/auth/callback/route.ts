import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Provide a safe fallback redirect
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully exchanged the code for a session, redirect to the dashboard!
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's no code or exchanging fails, safely redirect to login
  return NextResponse.redirect(`${origin}/login?message=Email%20verified.%20Please%20log%20in.`)
}
