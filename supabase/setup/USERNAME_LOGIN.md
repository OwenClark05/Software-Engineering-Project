# Username/password login setup

The React form calls `login-with-username`, which privately resolves
`public.profiles.username` to `profiles.uid`, then to the Auth email. Supabase Auth
checks the password. No passwords belong in profiles. Usernames currently match
case-sensitively; surrounding input whitespace is trimmed.

## Deploy

1. In your Supabase project's SQL Editor, run `supabase/setup/profiles.sql`.
   If you already have a profiles table, confirm its columns are `uid` and
   `username`, and that `uid` references `auth.users.id`. Review any existing RLS
   policies too: this script does not remove your other policies.
2. Install/sign in to the Supabase CLI, then run from the repository root:

   ```sh
   npx supabase login
   npx supabase functions deploy login-with-username --project-ref YOUR_PROJECT_REF
   ```

   The project reference is available in your project settings. Deploy to the
   same project used by your frontend's VITE_SUPABASE_URL. The function's
   `verify_jwt = false` configuration allows signed-out users to log in.
   Supabase supplies SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY
   to hosted Edge Functions. Never put a service-role key in a VITE variable.

## Create a test account

1. In Supabase, go to Authentication > Users > Add user > Create new user.
2. Enter an email you control and a strong password. For this manually created
   test account, enable Auto Confirm User if offered.
3. Copy the new user's UUID.
4. In Table Editor > profiles, insert a row with that UUID as `uid` and your
   chosen unique `username`. Leave created_at at its default. If a trigger
   already created the profile, edit that row instead.
5. Run `npm run dev`, sign out of any existing account, and open `/`. Enter the
   exact username and the password you assigned in Authentication.

An existing magic-link account needs a password set via Supabase Auth's password
reset/update flow; putting a password in profiles does nothing.

## Verification and limitations

Check valid credentials reach the dashboard, wrong passwords and unknown users
both fail, and signing out returns to login. Credentials and tokens must not be
logged. The frontend build does not type-check the Deno function; use
`deno check supabase/functions/login-with-username/index.ts` when Deno is available.

Supabase Auth rate limits still apply to password checks. Before public release,
add persistent request throttling/CAPTCHA to this public endpoint, including
unknown-username attempts; browser CORS is not abuse protection. The development
`/dashboard` preview still bypasses sign-in, so seeing it alone is not a login test.
The separate Create Account page is not implemented.
