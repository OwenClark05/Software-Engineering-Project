import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function CreateAccount() {
  const navigate = useNavigate()
  const submitting = useRef(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setError('')
    if (!/^[A-Za-z0-9_]{3,30}$/.test(username.trim())) {
      setError('Choose a username with 3–30 letters, numbers, or underscores.')
      return
    }
    if (password !== confirmation) {
      setError('Your passwords do not match.')
      return
    }
    submitting.current = true
    setLoading(true)
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { username: username.trim() },
          emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href,
        },
      })
      if (signupError) {
        setError(signupError.code === 'unexpected_failure'
          ? 'Could not create your account. Try a different username. If this continues, contact the site owner.'
          : signupError.message)
        return
      }
      setPassword('')
      setConfirmation('')
      if (data.session) navigate('/', { replace: true })
      else setSubmitted(true)
    } catch {
      setError('Unable to reach the signup service. Please try again.')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <h1>Create an account</h1>
      {submitted ? (
        <div role="status">
          <h2>Check your email</h2>
          <p>If signup is available for {email.trim()}, you’ll receive a confirmation link. Check your spam folder too.</p>
          <p>After confirming, sign in with your username and password. If you already have an account, return to login.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p><label htmlFor="signup-username">Username</label>
            <input id="signup-username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} minLength={3} maxLength={30} pattern="[A-Za-z0-9_]{3,30}" aria-describedby="username-help" required disabled={loading} /></p>
          <p id="username-help">Use 3–30 letters, numbers, or underscores. Usernames are case-sensitive.</p>
          <p><label htmlFor="signup-email">Email</label>
            <input id="signup-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} /></p>
          <p><label htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} aria-describedby="password-help" required disabled={loading} /></p>
          <p id="password-help">Use at least 8 characters.</p>
          <p><label htmlFor="signup-confirmation">Confirm password</label>
            <input id="signup-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} minLength={8} required disabled={loading} /></p>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
      )}
      <p><Link to="/">Back to login</Link></p>
    </main>
  )
}
