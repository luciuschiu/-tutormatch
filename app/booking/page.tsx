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

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)

    if (tutorId) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', tutorId).single()
      const { data: details } = await supabase.from('tutor_profiles').select('*').eq('id', tutorId).single()
      if (profile && details) setTutor({ ...profile, ...details })
    }

    const { data: myBookings } = await supabase
      .from('bookings')
      .select('*')
      .or('student_id.eq.' + session.user.id + ',tutor_id.eq.' + session.user.id)
      .order('start_time', { ascending: true })

    if (myBookings) {
      const enriched = []
      for (const b of myBookings) {
        const otherId = b.student_id === session.user.id ? b.tutor_id : b.student_id
        const { data: otherProfile } = await supabase.from('profiles').select('full_name, role').eq('id', otherId).single()
        enriched.push({ ...b, other_name: otherProfile?.full_name || 'Unknown', other_role: otherProfile?.role || 'user' })
      }
      setBookings(enriched)
    }

    setLoading(false)
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !tutorId || !selectedDate || !selectedTime || !selectedSubject) return
    setSubmitting(true)
    setMessage('')

    const startTime = new Date(selectedDate + 'T' + selectedTime + ':00+08:00')
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

    const { error } = await supabase.from('bookings').insert({
      student_id: userId,
      tutor_id: tutorId,
      subject: selectedSubject,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      notes: notes || null,
      price: tutor?.hourly_rate || null,
      status: 'pending'
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Booking requested! The tutor will confirm shortly. 🎉')
      setSelectedDate('')
      setSelectedTime('')
      setSelectedSubject('')
      setNotes('')
      loadData()
    }
    setSubmitting(false)
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    loadData()
  }

  function getMinDate() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return { bg: '#FEF3C7', color: '#D97706', label: '⏳ Pending' }
      case 'confirmed': return { bg: '#D1FAE5', color: '#059669', label: '✅ Confirmed' }
      case 'cancelled': return { bg: '#FEE2E2', color: '#DC2626', label: '❌ Cancelled' }
      case 'completed': return { bg: '#E0E7FF', color: '#4F46E5', label: '🎓 Completed' }
      default: return { bg: '#F1F5F9', color: '#64748B', label: status }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF5', color: '#1A1A2E', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>📅</div>
          <p style={{ fontWeight: 700, color: '#7C3AED' }}>Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF5', color: '#1A1A2E', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#1A1A2E' }}>
          <span style={{ fontSize: '24px' }}>🦦</span>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#7C3AED' }}>TutorMatch</span>
        </Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/search" style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>🔍 Search</Link>
          <Link href="/chat" style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>💬 Chat</Link>
          <Link href="/dashboard" style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 60px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>📅 Bookings</h1>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          <button onClick={() => setTab('book')} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: tab === 'book' ? '#7C3AED' : 'white', color: tab === 'book' ? 'white' : '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
            📝 New Booking
          </button>
          <button onClick={() => setTab('my')} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: tab === 'my' ? '#7C3AED' : 'white', color: tab === 'my' ? 'white' : '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
            📋 My Bookings ({bookings.length})
          </button>
        </div>

        {tab === 'book' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
            {!tutorId ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                <p style={{ fontWeight: 700, marginBottom: '8px' }}>Select a tutor first</p>
                <Link href="/search" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Browse tutors →</Link>
              </div>
            ) : tutor ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px', background: '#F3E8FF', borderRadius: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👩‍🏫</div>
                  <div>
                    <p style={{ fontWeight: 700, margin: 0 }}>{tutor.full_name}</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>S${tutor.hourly_rate}/hr • {tutor.location_area}</p>
                  </div>
                </div>

                <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Subject</label>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }}>
                      <option value="">Select subject</option>
                      {(tutor.subjects || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Date</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={getMinDate()} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Time</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {TIME_SLOTS.map(time => (
                        <button key={time} type="button" onClick={() => setSelectedTime(time)} style={{ padding: '8px 16px', borderRadius: '8px', border: selectedTime === time ? 'none' : '2px solid #E2E8F0', background: selectedTime === time ? '#7C3AED' : 'white', color: selectedTime === time ? 'white' : '#1A1A2E', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any topics you want to cover?" rows={2} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', resize: 'none', background: 'white', color: '#1A1A2E' }} />
                  </div>

                  {tutor.hourly_rate && (
                    <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Lesson price (1 hour)</span>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: '#059669' }}>S${tutor.hourly_rate}</span>
                    </div>
                  )}

                  {message && (
                    <div style={{ padding: '12px', borderRadius: '10px', background: message.startsWith('Error') ? '#FEE2E2' : '#D1FAE5' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: message.startsWith('Error') ? '#DC2626' : '#059669', margin: 0 }}>{message}</p>
                    </div>
                  )}

                  <button type="submit" disabled={submitting} style={{ padding: '14px', borderRadius: '10px', border: 'none', background: '#7C3AED', color: 'white', fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', fontSize: '16px', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? '⏳ Booking...' : '📅 Request Booking'}
                  </button>
                </form>
              </>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748B' }}>Tutor not found</p>
            )}
          </div>
        )}

        {tab === 'my' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                <p style={{ fontWeight: 700, marginBottom: '8px' }}>No bookings yet</p>
                <Link href="/search" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Find a tutor →</Link>
              </div>
            ) : bookings.map(booking => {
              const status = getStatusColor(booking.status)
              const startDate = new Date(booking.start_time)
              const isOwner = booking.student_id === userId
              return (
                <div key={booking.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>{booking.subject}</p>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        with {booking.other_role === 'tutor' ? '👩‍🏫' : '🎓'} {booking.other_name}
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748B', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span>📅 {startDate.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span>🕐 {startDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</span>
                    {booking.price && <span>💰 S${booking.price}</span>}
                  </div>

                  {booking.notes && <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>📝 {booking.notes}</p>}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {booking.status === 'pending' && !isOwner && (
                      <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>✅ Confirm</button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} style={{ padding: '8px 16px', borderRadius: '8px', border: '2px solid #FCA5A5', background: 'white', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                    )}
                    {booking.status === 'confirmed' && isOwner && (
                      <button onClick={() => updateBookingStatus(booking.id, 'completed')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#4F46E5', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>🎓 Mark Complete</button>
                    )}
                    {booking.status === 'completed' && (
                      <Link href={'/review?booking=' + booking.id + '&reviewee=' + (isOwner ? booking.tutor_id : booking.student_id)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#F59E0B', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>⭐ Leave Review</Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF5', color: '#1A1A2E', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>📅</div>
          <p style={{ fontWeight: 700, color: '#7C3AED' }}>Loading bookings...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
