'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tutorId = searchParams.get('tutor')
  const [userId, setUserId] = useState<string | null>(null)
  const [tutor, setTutor] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState<'book' | 'my'>('book')
  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

  useEffect(() => { loadData() }, [])
  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)
    if (tutorId) { const { data: p } = await supabase.from('profiles').select('*').eq('id', tutorId).single(); const { data: d } = await supabase.from('tutor_profiles').select('*').eq('id', tutorId).single(); if (p && d) setTutor({ ...p, ...d }) }
    const { data: mb } = await supabase.from('bookings').select('*').or('student_id.eq.' + session.user.id + ',tutor_id.eq.' + session.user.id).order('start_time', { ascending: true })
    if (mb) { const enriched = []; for (const b of mb) { const otherId = b.student_id === session.user.id ? b.tutor_id : b.student_id; const { data: op } = await supabase.from('profiles').select('full_name, role').eq('id', otherId).single(); enriched.push({ ...b, other_name: op?.full_name || 'Unknown', other_role: op?.role || 'user' }) }; setBookings(enriched) }
    setLoading(false)
  }
  async function handleBook(e: React.FormEvent) {
    e.preventDefault(); if (!userId || !tutorId || !selectedDate || !selectedTime || !selectedSubject) return; setSubmitting(true); setMessage('')
    const st = new Date(selectedDate + 'T' + selectedTime + ':00+08:00'); const et = new Date(st.getTime() + 3600000)
    const { error } = await supabase.from('bookings').insert({ student_id: userId, tutor_id: tutorId, subject: selectedSubject, start_time: st.toISOString(), end_time: et.toISOString(), notes: notes || null, price: tutor?.hourly_rate || null, status: 'pending' })
    if (error) { setMessage('Error: ' + error.message) } else { setMessage('Booking requested! 🎉'); setSelectedDate(''); setSelectedTime(''); setSelectedSubject(''); setNotes(''); loadData() }
    setSubmitting(false)
  }
  async function updateStatus(id: string, status: string) { await supabase.from('bookings').update({ status }).eq('id', id); loadData() }
  function getMinDate() { const t = new Date(); t.setDate(t.getDate() + 1); return t.toISOString().split('T')[0] }
  function statusStyle(s: string) { const m: Record<string, any> = { pending: { bg: '#FEF3C7', color: '#D97706', label: '⏳ Pending' }, confirmed: { bg: '#D1FAE5', color: '#059669', label: '✅ Confirmed' }, cancelled: { bg: '#FEE2E2', color: '#DC2626', label: '❌ Cancelled' }, completed: { bg: '#FFF0DB', color: '#E67E22', label: '🎓 Completed' } }; return m[s] || { bg: '#F5EDE3', color: '#6B5B4E', label: s } }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '16px' }}>📅</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Loading bookings...</p></div></div>

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#2C1810' }}><span style={{ fontSize: '24px' }}>🦫</span><span style={{ fontWeight: 900, fontSize: '18px', color: '#E67E22', fontFamily: 'Nunito' }}>TutorMatch</span></Link>
        <div style={{ display: 'flex', gap: '16px' }}><Link href="/search" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>🔍 Search</Link><Link href="/chat" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>💬 Chat</Link><Link href="/dashboard" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>← Dashboard</Link></div>
      </nav>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 60px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', textAlign: 'center', fontFamily: 'Nunito' }}>📅 Bookings</h1>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          <button onClick={() => setTab('book')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: tab === 'book' ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : 'white', color: tab === 'book' ? 'white' : '#6B5B4E', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'Nunito' }}>📝 New Booking</button>
          <button onClick={() => setTab('my')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: tab === 'my' ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : 'white', color: tab === 'my' ? 'white' : '#6B5B4E', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'Nunito' }}>📋 My Bookings ({bookings.length})</button>
        </div>

        {tab === 'book' && <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E8DFD4' }}>
          {!tutorId ? <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div><p style={{ fontWeight: 800, marginBottom: '8px', fontFamily: 'Nunito' }}>Select a tutor first</p><Link href="/search" style={{ color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>Browse tutors →</Link></div> : tutor ? <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px', background: '#FFF0DB', borderRadius: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFE0B2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👩‍🏫</div>
              <div><p style={{ fontWeight: 800, margin: 0, fontFamily: 'Nunito' }}>{tutor.full_name}</p><p style={{ fontSize: '13px', color: '#6B5B4E', margin: 0 }}>S${tutor.hourly_rate}/hr • {tutor.location_area}</p></div>
            </div>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Subject</label><select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '14px', background: 'white', color: '#2C1810', fontFamily: 'Quicksand' }}><option value="">Select subject</option>{(tutor.subjects || []).map((s: string) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Date</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={getMinDate()} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '14px', background: 'white', color: '#2C1810', fontFamily: 'Quicksand' }} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Time</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{TIME_SLOTS.map(t => <button key={t} type="button" onClick={() => setSelectedTime(t)} style={{ padding: '8px 16px', borderRadius: '10px', border: selectedTime === t ? 'none' : '2px solid #E8DFD4', background: selectedTime === t ? '#E67E22' : 'white', color: selectedTime === t ? 'white' : '#2C1810', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito' }}>{t}</button>)}</div></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Notes (optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any topics you want to cover?" rows={2} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '14px', resize: 'none', background: 'white', color: '#2C1810', fontFamily: 'Quicksand' }} /></div>
              {tutor.hourly_rate && <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'Nunito' }}>Lesson price (1 hour)</span><span style={{ fontWeight: 900, fontSize: '16px', color: '#27AE60', fontFamily: 'Nunito' }}>S${tutor.hourly_rate}</span></div>}
              {message && <div style={{ padding: '12px', borderRadius: '12px', background: message.startsWith('Error') ? '#FEE2E2' : '#D1FAE5' }}><p style={{ fontSize: '14px', fontWeight: 700, color: message.startsWith('Error') ? '#DC2626' : '#27AE60', margin: 0, fontFamily: 'Nunito' }}>{message}</p></div>}
              <button type="submit" disabled={submitting} style={{ padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: submitting ? 'wait' : 'pointer', fontSize: '16px', opacity: submitting ? 0.7 : 1, fontFamily: 'Nunito', boxShadow: '0 4px 16px rgba(230,126,34,0.3)' }}>{submitting ? '⏳ Booking...' : '📅 Request Booking'}</button>
            </form>
          </> : <p style={{ textAlign: 'center', color: '#6B5B4E' }}>Tutor not found</p>}
        </div>}

        {tab === 'my' && <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div><p style={{ fontWeight: 800, marginBottom: '8px', fontFamily: 'Nunito' }}>No bookings yet</p><Link href="/search" style={{ color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>Find a tutor →</Link></div>
          : bookings.map(b => { const s = statusStyle(b.status); const d = new Date(b.start_time); const isOwner = b.student_id === userId; return (
            <div key={b.id} style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #E8DFD4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div><p style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 4px', fontFamily: 'Nunito' }}>{b.subject}</p><p style={{ fontSize: '13px', color: '#6B5B4E', margin: 0 }}>with {b.other_role === 'tutor' ? '👩‍🏫' : '🎓'} {b.other_name}</p></div>
                <span style={{ padding: '4px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, background: s.bg, color: s.color, fontFamily: 'Nunito' }}>{s.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6B5B4E', marginBottom: '12px', flexWrap: 'wrap' }}><span>📅 {d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })}</span><span>🕐 {d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</span>{b.price && <span>💰 S${b.price}</span>}</div>
              {b.notes && <p style={{ fontSize: '13px', color: '#6B5B4E', marginBottom: '12px' }}>📝 {b.notes}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                {b.status === 'pending' && !isOwner && <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#27AE60', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito' }}>✅ Confirm</button>}
                {(b.status === 'pending' || b.status === 'confirmed') && <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ padding: '8px 16px', borderRadius: '10px', border: '2px solid #FCA5A5', background: 'white', color: '#DC2626', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito' }}>Cancel</button>}
                {b.status === 'confirmed' && isOwner && <button onClick={() => updateStatus(b.id, 'completed')} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#E67E22', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito' }}>🎓 Complete</button>}
                {b.status === 'completed' && <Link href={'/review?booking=' + b.id + '&reviewee=' + (isOwner ? b.tutor_id : b.student_id)} style={{ padding: '8px 16px', borderRadius: '10px', background: '#F5B041', color: 'white', fontWeight: 800, textDecoration: 'none', fontSize: '13px', fontFamily: 'Nunito' }}>⭐ Review</Link>}
              </div>
            </div>
          ) })}
        </div>}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '16px' }}>📅</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Loading...</p></div></div>}><BookingContent /></Suspense>
}
