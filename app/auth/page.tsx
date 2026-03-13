'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [isLogin, setIsLogin] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Working...')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setMessage('Error: ' + error.message); return }
        setMessage('Logged in! Going to dashboard...')
        window.location.href = '/dashboard'
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name, role } }
        })
        if (error) { setMessage('Error: ' + error.message); return }
        setMessage('Signed up! Going to dashboard...')
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setMessage('Something went wrong')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🦦 TutorMatch</h1>
      <h2 style={{ textAlign: 'center' }}>{isLogin ? 'Log In' : 'Sign Up'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isLogin && (
          <>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: role === 'student' ? '#7C3AED' : '#eee', color: role === 'student' ? 'white' : 'black', cursor: 'pointer', fontWeight: 'bold' }}>🎓 Student</button>
              <button type="button" onClick={() => setRole('tutor')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: role === 'tutor' ? '#32D0C9' : '#eee', color: role === 'tutor' ? 'white' : 'black', cursor: 'pointer', fontWeight: 'bold' }}>👩‍🏫 Tutor</button>
            </div>
          </>
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }} />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }} />
        <button type="submit" style={{ padding: '14px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          {isLogin ? 'Log In →' : 'Sign Up →'}
        </button>
      </form>

      {message && <p style={{ textAlign: 'center', marginTop: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>{message}</p>}

      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={() => { setIsLogin(!isLogin); setMessage('') }} style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontWeight: 'bold' }}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </p>
    </div>
  )
}