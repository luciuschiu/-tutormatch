'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function StarRating({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>{label}</label>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button" onClick={() => onChange(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', transform: (hover >= star || value >= star) ? 'scale(1.2)' : 'scale(1)' }}>
            {(hover >= star || value >= star) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    </div>
  )
}

function ReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking')
  const revieweeId = searchParams.get('reviewee')
  const [userId, setUserId] = useState<string | null>(null)
  const [revieweeName, setRevieweeName] = useState('')
  const [overall, setOverall] = useState(0)
  const [teaching, setTeaching] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [punctuality, setPunctuality] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => { loadData() }, [])
  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)
    if (revieweeId) { const { data: p } = await supabase.from('profiles').select('full_name').eq('id', revieweeId).single(); if (p) setRevieweeName(p.full_name) }
    if (bookingId) { const { data: ex } = await supabase.from('reviews').select('id').eq('booking_id', bookingId).eq('reviewer_id', session.user.id); if (ex && ex.length > 0) { setDone(true); setMessage('You have already reviewed this lesson!') } }
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!userId || !bookingId || !revieweeId || overall === 0) return; setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({ booking_id: bookingId, reviewer_id: userId, reviewee_id: revieweeId, overall_rating: overall, teaching_rating: teaching || overall, communication_rating: communication || overall, punctuality_rating: punctuality || overall, comment: comment || null })
    if (error) { setMessage('Error: ' + error.message) } else {
      const { data: all } = await supabase.from('reviews').select('overall_rating').eq('reviewee_id', revieweeId)
      if (all && all.length > 0) { const avg = all.reduce((s, r) => s + r.overall_rating, 0) / all.length; await supabase.from('tutor_profiles').update({ rating: Math.round(avg * 100) / 100, total_reviews: all.length }).eq('id', revieweeId) }
      setDone(true); setMessage('Review submitted! Thank you 🎉')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '700px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#2C1810' }}><span style={{ fontSize: '24px' }}>🦫</span><span style={{ fontWeight: 900, fontSize: '18px', color: '#E67E22', fontFamily: 'Nunito' }}>TutorMatch</span></Link>
        <Link href="/booking" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>← Bookings</Link>
      </nav>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}><div style={{ fontSize: '48px', marginBottom: '8px' }}>⭐</div><h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px', fontFamily: 'Nunito' }}>Rate Your Lesson</h1>{revieweeName && <p style={{ color: '#6B5B4E' }}>How was your session with {revieweeName}?</p>}</div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E8DFD4' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div><p style={{ fontWeight: 800, fontSize: '16px', marginBottom: '16px', fontFamily: 'Nunito' }}>{message}</p><Link href="/booking" style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, textDecoration: 'none', fontSize: '14px', fontFamily: 'Nunito' }}>Back to Bookings</Link></div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <StarRating value={overall} onChange={setOverall} label="Overall Rating *" />
              <StarRating value={teaching} onChange={setTeaching} label="Teaching Quality" />
              <StarRating value={communication} onChange={setCommunication} label="Communication" />
              <StarRating value={punctuality} onChange={setPunctuality} label="Punctuality" />
              <div style={{ marginBottom: '16px' }}><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Comments (optional)</label><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." rows={3} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '14px', resize: 'none', background: 'white', color: '#2C1810', fontFamily: 'Quicksand' }} /></div>
              {message && !done && <div style={{ padding: '12px', borderRadius: '12px', background: '#FEE2E2', marginBottom: '12px' }}><p style={{ fontSize: '14px', color: '#DC2626', fontWeight: 700, margin: 0, fontFamily: 'Nunito' }}>{message}</p></div>}
              <button type="submit" disabled={submitting || overall === 0} style={{ padding: '14px', borderRadius: '14px', border: 'none', background: overall === 0 ? '#D5C4A1' : 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: overall === 0 ? 'default' : 'pointer', fontSize: '16px', opacity: submitting ? 0.7 : 1, fontFamily: 'Nunito' }}>{submitting ? '⏳ Submitting...' : '⭐ Submit Review'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReviewPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '16px' }}>⭐</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Loading...</p></div></div>}><ReviewContent /></Suspense>
}
