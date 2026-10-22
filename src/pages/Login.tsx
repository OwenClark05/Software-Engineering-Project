import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../utils/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      setMessage(error ? error.message : 'Check your email for the login link!')
    } catch {
      setMessage('Unable to send the login link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <p>Sign in via magic link with your email below.</p>
      <form onSubmit={handleLogin}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
        <p role="status">{message}</p>
      </form>
    </main>
  )
}
