import { useState } from 'react'
import type { FormEvent } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'

export default function Login() {
  const [enteredName, setEnteredName] = useState('')
  const [enteredPassword, setEnteredPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase.functions.invoke('login-with-username', {
        body: { username: enteredName.trim(), password: enteredPassword },
      })
      if (error) {
        if (error instanceof FunctionsHttpError) {
          const body = await error.context.json().catch(() => null)
          setErrorMessage(body?.error || 'Unable to log in. Please try again.')
        } else {
          setErrorMessage('Unable to reach the login service. Please try again later.')
        }
        return
      }
      if (!data?.session?.access_token || !data?.session?.refresh_token) {
        setErrorMessage('Unable to log in. Please try again.')
        return
      }
      const { error: sessionError } = await supabase.auth.setSession(data.session)
      if (sessionError) {
        setErrorMessage('Unable to start your session. Please log in again.')
      } else {
        setEnteredPassword('')
        // App's auth listener redirects authenticated users to /dashboard.
      }
    } catch {
      setErrorMessage('Unable to log in. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <h1>5 Guys Coding</h1>
      <img
        src="https://ih1.redbubble.net/image.2000986734.3760/raf,360x360,075,t,fafafa:ca443f4786.jpg"
        alt="5 Guys Coding logo"
        width={200}
      />
      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="username">Please enter your username</label>
        </p>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={enteredName}
          onChange={(event) => setEnteredName(event.target.value)}
          placeholder="Enter your username"
          maxLength={100}
          required
        />
        <p>
          <label htmlFor="password">Please enter your password</label>
        </p>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={enteredPassword}
          onChange={(event) => setEnteredPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />
        <p>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </p>
        {errorMessage && <p role="alert">{errorMessage}</p>}
      </form>
      <p>Make an account</p>
      <button type="button" disabled>
        Create Account
      </button>
    </main>
  )
}
