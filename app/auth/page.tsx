'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
        setMessage('Logged in!')
        window.location.href = '/dashboard'
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name, role } }
        })
        if (error) { setMessage('Error: ' + error.message); return }
        setMessage('Signed up!')
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setMessage('Something went wrong')
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
      <div className="blob-amber" style={{ top: '-200px', right: '-100px' }} />
      <div className="blob-teal" style={{ bottom: '-100px', left: '-100px' }} />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8" style={{ textDecoration: 'none' }}>
          <span className="text-4xl animate-wiggle">🦫</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '28px' }} className="gradient-text">TutorMatch</span>
        </Link>

        <div className="glass-card p-8" style={{ borderRadius: '24px' }}>
          <h2 style={{ fontFamily: 'Nunito', fontSize: '24px', fontWeight: 900, textAlign: 'center', marginBottom: '4px', color: 'var(--charcoal)' }}>
            {isLogin ? 'Welcome back! 🦫' : 'Join TutorMatch'}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--slate)', marginBottom: '24px' }}>
            {isLogin ? 'Log in to find your perfect match' : 'Start learning or teaching today'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isLogin && (
              <>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '6px', display: 'block', fontFamily: 'Nunito' }}>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tan Wei Ming" className="input-field" required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '6px', display: 'block', fontFamily: 'Nunito' }}>I am a...</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: role === 'student' ? 'linear-gradient(135deg, var(--amber), var(--amber-dark))' : 'white', color: role === 'student' ? 'white' : 'var(--slate)', cursor: 'pointer', fontWeight: 800, fontFamily: 'Nunito', fontSize: '14px', boxShadow: role === 'student' ? '0 4px 16px rgba(230,126,34,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
                      🎓 Student
                    </button>
                    <button type="button" onClick={() => setRole('tutor')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: role === 'tutor' ? 'linear-gradient(135deg, var(--teal), #1E8C8C)' : 'white', color: role === 'tutor' ? 'white' : 'var(--slate)', cursor: 'pointer', fontWeight: 800, fontFamily: 'Nunito', fontSize: '14px', boxShadow: role === 'tutor' ? '0 4px 16px rgba(43,165,165,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
                      👩‍🏫 Tutor
                    </button>
                  </div>
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '6px', display: 'block', fontFamily: 'Nunito' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field" required />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '6px', display: 'block', fontFamily: 'Nunito' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="input-field" minLength={6} required />
            </div>

            {message && (
              <div style={{ padding: '12px', borderRadius: '12px', background: message.startsWith('Error') ? 'rgba(231,76,60,0.08)' : 'rgba(39,174,96,0.08)', border: message.startsWith('Error') ? '1px solid rgba(231,76,60,0.2)' : '1px solid rgba(39,174,96,0.2)' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: message.startsWith('Error') ? '#E74C3C' : 'var(--success)', margin: 0 }}>
                  {message.startsWith('Error') ? '❌' : '✅'} {message}
                </p>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: '4px', fontSize: '16px' }}>
              {isLogin ? 'Log in →' : `Sign up as ${role} →`}
            </button>
          </form>

          <div className="text-center mt-6">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage('') }} style={{ fontSize: '14px', color: 'var(--amber)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito' }}>
              {isLogin ? "Don't have an account? Sign up free" : 'Already have an account? Log in'}
            </button>
          </div>
        </div>

        <p className="text-center mt-6" style={{ fontSize: '12px', color: 'var(--slate)' }}>🦫 Capy approves this message</p>
      </div>
    </main>
  )
}
