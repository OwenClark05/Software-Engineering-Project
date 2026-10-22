import { createClient } from 'npm:@supabase/supabase-js@2.115.0'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

function respond(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status, headers })
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers })
  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405)

  let input
  try {
    input = await request.json()
  } catch {
    return respond({ error: 'Invalid request.' }, 400)
  }
  const username = typeof input?.username === 'string' ? input.username.trim() : ''
  const password = input?.password
  if (!username || username.length > 100 || typeof password !== 'string' || !password || password.length > 4096) {
    return respond({ error: 'Enter a valid username and password.' }, 400)
  }

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const options = { auth: { persistSession: false, autoRefreshToken: false } }
    // The service-role key stays in this server function, never in the browser.
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, options)
    const { data: profile, error: profileError } = await admin
      .from('profiles').select('uid').eq('username', username).maybeSingle()
    if (profileError) return respond({ error: 'Login service unavailable. Please try again later.' }, 503)
    const invalid = () => respond({ error: 'Invalid username or password.' }, 401)
    if (!profile) return invalid()

    const { data: account, error: accountError } = await admin.auth.admin.getUserById(profile.uid)
    if (accountError || !account.user?.email) return invalid()

    // Use a separate client so sign-in never changes the admin client's session.
    const auth = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, options)
    const { data, error } = await auth.auth.signInWithPassword({ email: account.user.email, password })
    if (error || !data.session) {
      if (error?.status === 429) return respond({ error: 'Too many attempts. Please try again later.' }, 429)
      return invalid()
    }
    return respond({ session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    } })
  } catch {
    return respond({ error: 'Login service unavailable. Please try again later.' }, 503)
  }
})
