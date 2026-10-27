import './index.css'
import { useState, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import type { JwtPayload } from '@supabase/supabase-js'
import { supabase } from './utils/supabase'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'

export default function App() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [claims, setClaims] = useState<JwtPayload | null>(null)

  // Check URL params on initial render
  const params = new URLSearchParams(window.location.search)
  const hasTokenHash = params.get('token_hash')

  const [verifying, setVerifying] = useState(!!hasTokenHash)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(false)

  useEffect(() => {
    // Check if we have token_hash in URL (magic link callback)
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash')
    const type = params.get('type')

    if (token_hash) {
      // Verify the OTP token
      supabase.auth
        .verifyOtp({
          token_hash,
          type: type || 'email',
        })
        .then(({ error }) => {
          if (error) {
            setAuthError(error.message)
          } else {
            setAuthSuccess(true)
            // Clear URL params
            navigate('/', { replace: true })
          }
          setVerifying(false)
        })
    }

    // Check for existing session using getClaims
    supabase.auth.getClaims().then(({ data, error }) => {
      setClaims(error ? null : (data?.claims ?? null))
      setCheckingSession(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data, error }) => {
        setClaims(error ? null : (data?.claims ?? null))
      })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
      return
    }
    setAuthSuccess(false)
    setClaims(null)
    navigate('/', { replace: true })
  }

  // Show verification state
  if (verifying || checkingSession) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>{verifying ? 'Confirming your magic link...' : 'Checking your session...'}</p>
        <p>Loading...</p>
      </div>
    )
  }

  // Show auth error
  if (authError) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>✗ Authentication failed</p>
        <p>{authError}</p>
        <button
          onClick={() => {
            setAuthError(null)
            navigate('/', { replace: true })
          }}
        >
          Return to login
        </button>
      </div>
    )
  }

  // Show auth success (briefly before claims load)
  if (authSuccess && !claims) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>✓ Authentication successful!</p>
        <p>Loading your account...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={claims ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          claims || import.meta.env.DEV
            ? <Dashboard onLogout={handleLogout} />
            : <Navigate to="/" replace />
        }
      />
      <Route
        path="/create-account"
        element={
          <CreateAccount />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
