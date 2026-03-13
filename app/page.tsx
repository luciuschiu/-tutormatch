'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<'student' | 'tutor'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('Logged in! Redirecting...')
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name, role: role } }
        })
        if (error) throw error
        setMessage('Check your email for a confirmation link! 📧')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
      <div className="blob-violet" style={{ top: '-200px', right: '-100px' }} />
      <div className="blob-coral" style={{ bottom: '-100px', left: '-100px' }} />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-4xl">🦦</span>
          <span style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '28px' }} className="gradient-text">TutorMatch</span>
        </Link>

        <div className="glass-card p-8" style={{ borderRadius: '24px' }}>
          <h2 style={{ fontFamily: 'Bricolage Grotesque', fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '4px' }}>
            {isLogin ? 'Welcome back!' : 'Join TutorMatch'}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--slate)', marginBottom: '24px' }}>
            {isLogin ? 'Log in to find your perfect match' : 'Start learning or teaching today'}
          </p>

          {!isLogin && (
            <div className="flex gap-2 mb-6">
              <button type="button" onClick={() => setRole('student')} className="flex-1 py-3 rounded-xl text-center transition-all duration-300" style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: '14px', background: role === 'student' ? 'linear-gradient(135deg, var(--violet), var(--violet-dark))' : 'white', color: role === 'student' ? 'white' : 'var(--slate)', border: role === 'student' ? 'none' : '2px solid #E2E8F0', boxShadow: role === 'student' ? '0 4px 16px rgba(124,58,237,0.3)' : 'none' }}>
                🎓 I&apos;m a Student
              </button>
              <button type="button" onClick={() => setRole('tutor')} className="flex-1 py-3 rounded-xl text-center transition-all duration-300" style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: '14px', background: role === 'tutor' ? 'linear-gradient(135deg, var(--teal), #0D9488)' : 'white', color: role === 'tutor' ? 'white' : 'var(--slate)', border: role === 'tutor' ? 'none' : '2px solid #E2E8F0', boxShadow: role === 'tutor' ? '0 4px 16px rgba(50,208,201,0.3)' : 'none' }}>
                👩‍🏫 I&apos;m a Tutor
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tan Wei Ming" className="input-field" required />
              </div>
            )}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '6px', display: 'block' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="input-field" required />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '6px', display: 'block' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="input-field" minLength={6} required />
            </div>

            {error && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p style={{ fontSize: '14px', color: '#EF4444', fontWeight: 500 }}>❌ {error}</p>
              </div>
            )}
            {message && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 500 }}>✅ {message}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full" style={{ marginTop: '4px', opacity: loading ? 0.7 : 1, textAlign: 'center' }}>
              {loading ? '⏳ Please wait...' : isLogin ? 'Log in →' : `Sign up as ${role} →`}
            </button>
          </form>

          <div className="text-center mt-6">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setMessage('') }} style={{ fontSize: '14px', color: 'var(--violet)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              {isLogin ? "Don't have an account? Sign up free" : 'Already have an account? Log in'}
            </button>
          </div>
        </div>

        <p className="text-center mt-6" style={{ fontSize: '12px', color: 'var(--slate)' }}>🦦 By signing up you agree to be awesome</p>
      </div>
    </main>
  )
}