'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Types
type Profile = { id: string; full_name: string; role: string; bio: string | null; avatar_url: string | null }
type StudentProfile = { level: string | null; subjects: string[]; location_area: string | null; budget_min: number | null; budget_max: number | null; learning_style: string | null }
type TutorProfileData = { subjects: string[]; levels: string[]; hourly_rate: number | null; location_area: string | null; teaching_style: string | null; experience_years: number | null; qualifications: string | null; rating: number; total_reviews: number }
type TutorWithProfile = { id: string; full_name: string; bio: string | null; tutor_profile: TutorProfileData; matchScore?: number }
type StudentData = { subjects: string[]; level: string | null; location_area: string | null; budget_min: number | null; budget_max: number | null; learning_style: string | null }
type Conversation = { id: string; student_id: string; tutor_id: string; last_message: string | null; last_message_at: string; other_name: string; other_role: string }
type Message = { id: string; conversation_id: string; sender_id: string; content: string; read: boolean; created_at: string }
type BookingType = { id: string; student_id: string; tutor_id: string; subject: string; start_time: string; end_time: string; status: string; notes: string | null; price: number | null; other_name: string; other_role: string }

function calculateMatch(tutor: TutorWithProfile, student: StudentData): number {
  let score = 0
  const ts = tutor.tutor_profile.subjects || [], ss = student.subjects || []
  if (ss.length > 0 && ts.length > 0) { score += 25 * (ss.filter(s => ts.includes(s)).length / ss.length) } else { score += 12 }
  if (student.level && (tutor.tutor_profile.levels || []).includes(student.level)) { score += 15 } else if (!student.level) { score += 7 }
  if (student.location_area && tutor.tutor_profile.location_area) { score += student.location_area === tutor.tutor_profile.location_area ? 15 : 4 } else { score += 7 }
  const rate = tutor.tutor_profile.hourly_rate
  if (rate && student.budget_max) { if (rate <= student.budget_max && rate >= (student.budget_min || 0)) { score += 12 } else if (rate <= student.budget_max * 1.2) { score += 6 } } else { score += 6 }
  score += 10 * ((tutor.tutor_profile.rating || 0) / 5)
  if (student.learning_style && tutor.tutor_profile.teaching_style) { score += student.learning_style === tutor.tutor_profile.teaching_style ? 8 : 2 } else { score += 4 }
  score += 10 * Math.min((tutor.tutor_profile.experience_years || 0) / 5, 1)
  score += 5 * Math.min((tutor.tutor_profile.total_reviews || 0) / 30, 1)
  return Math.round(score)
}

// ==================== BOOKING TAB ====================
function BookingTab({ userId, bookings, onRefresh }: { userId: string; bookings: BookingType[]; onRefresh: () => void }) {
  async function updateStatus(id: string, status: string) { await supabase.from('bookings').update({ status }).eq('id', id); onRefresh() }
  function statusStyle(s: string) { const m: Record<string, { bg: string; color: string; label: string }> = { pending: { bg: '#FEF3C7', color: '#D97706', label: '⏳ Pending' }, confirmed: { bg: '#D1FAE5', color: '#059669', label: '✅ Confirmed' }, cancelled: { bg: '#FEE2E2', color: '#DC2626', label: '❌ Cancelled' }, completed: { bg: '#FFF0DB', color: '#E67E22', label: '🎓 Done' } }; return m[s] || { bg: '#F5EDE3', color: '#6B5B4E', label: s } }

  return (
    <div style={{ padding: '20px 16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'Nunito', marginBottom: '16px' }}>📅 Bookings</h2>
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: '56px', marginBottom: '12px' }}>📅</div><p style={{ fontWeight: 800, fontFamily: 'Nunito', color: '#6B5B4E', fontSize: '16px' }}>No bookings yet</p><p style={{ color: '#A0937E', fontSize: '14px', marginTop: '6px' }}>Find a tutor and book your first lesson!</p></div>
      ) : bookings.map(b => { const s = statusStyle(b.status); const d = new Date(b.start_time); const isOwner = b.student_id === userId; return (
        <div key={b.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8DFD4', marginBottom: '10px', boxShadow: '0 2px 8px rgba(139,105,20,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div><p style={{ fontWeight: 800, fontSize: '15px', fontFamily: 'Nunito', margin: 0 }}>{b.subject}</p><p style={{ fontSize: '12px', color: '#6B5B4E', margin: '2px 0 0' }}>with {b.other_name}</p></div>
            <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, background: s.bg, color: s.color, fontFamily: 'Nunito', height: 'fit-content' }}>{s.label}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6B5B4E', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span>📅 {d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <span>🕐 {d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</span>
            {b.price && <span>💰 S${b.price}</span>}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {b.status === 'pending' && !isOwner && <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#27AE60', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito' }}>✅ Confirm</button>}
            {(b.status === 'pending' || b.status === 'confirmed') && <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #FCA5A5', background: 'white', color: '#DC2626', fontWeight: 800, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito' }}>Cancel</button>}
            {b.status === 'confirmed' && isOwner && <button onClick={() => updateStatus(b.id, 'completed')} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#E67E22', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito' }}>🎓 Complete</button>}
          </div>
        </div>
      ) })}
    </div>
  )
}

// ==================== CHAT TAB ====================
function ChatTab({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loaded, setLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadConvos() }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    if (!activeConvo) return
    const ch = supabase.channel('msg-' + activeConvo.id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + activeConvo.id }, (p) => { setMessages(prev => [...prev, p.new as Message]) }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [activeConvo])

  async function loadConvos() {
    const { data } = await supabase.from('conversations').select('*').or('student_id.eq.' + userId + ',tutor_id.eq.' + userId).order('last_message_at', { ascending: false })
    if (data) {
      const r: Conversation[] = []
      for (const c of data) { const oid = c.student_id === userId ? c.tutor_id : c.student_id; const { data: op } = await supabase.from('profiles').select('full_name, role').eq('id', oid).single(); r.push({ ...c, other_name: op?.full_name || 'Unknown', other_role: op?.role || 'user' }) }
      setConversations(r)
    }
    setLoaded(true)
  }

  async function openConvo(c: Conversation) {
    setActiveConvo(c)
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', c.id).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvo) return
    const content = newMessage.trim(); setNewMessage('')
    await supabase.from('messages').insert({ conversation_id: activeConvo.id, sender_id: userId, content })
    await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', activeConvo.id)
  }

  if (activeConvo) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5EDE3', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button onClick={() => setActiveConvo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', padding: '2px 6px' }}>‹</button>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{activeConvo.other_role === 'tutor' ? '👩‍🏫' : '🎓'}</div>
        <p style={{ fontWeight: 800, fontSize: '15px', fontFamily: 'Nunito', margin: 0 }}>{activeConvo.other_name}</p>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {messages.length === 0 && <p style={{ textAlign: 'center', color: '#6B5B4E', padding: '40px 0', fontSize: '15px' }}>Say hello! 👋</p>}
        {messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.sender_id === userId ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
            <div style={{ padding: '10px 14px', borderRadius: m.sender_id === userId ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.sender_id === userId ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : '#F5EDE3', color: m.sender_id === userId ? 'white' : '#2C1810', fontSize: '14px', lineHeight: 1.45 }}>{m.content}</div>
            <p style={{ fontSize: '10px', color: '#A0937E', marginTop: '2px', textAlign: m.sender_id === userId ? 'right' : 'left' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={send} style={{ padding: '10px 12px', borderTop: '1px solid #F5EDE3', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message..." style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '2px solid #E8DFD4', fontSize: '16px', outline: 'none', background: '#FAFAF5', color: '#2C1810', fontFamily: 'Quicksand' }} />
        <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
      </form>
    </div>
  )

  return (
    <div style={{ padding: '20px 16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'Nunito', marginBottom: '16px' }}>💬 Messages</h2>
      {!loaded ? <p style={{ textAlign: 'center', color: '#E67E22', fontWeight: 700, fontFamily: 'Nunito', padding: '40px 0' }}>Loading...</p> :
      conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: '56px', marginBottom: '12px' }}>🦫</div><p style={{ fontWeight: 800, fontFamily: 'Nunito', color: '#6B5B4E', fontSize: '16px' }}>No messages yet</p><p style={{ color: '#A0937E', fontSize: '14px', marginTop: '6px' }}>Find a tutor to start chatting!</p></div>
      ) : conversations.map(c => (
        <div key={c.id} onClick={() => openConvo(c)} style={{ padding: '14px 4px', cursor: 'pointer', borderBottom: '1px solid #F5EDE3', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{c.other_role === 'tutor' ? '👩‍🏫' : '🎓'}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}><p style={{ fontWeight: 800, fontSize: '15px', fontFamily: 'Nunito', margin: 0 }}>{c.other_name}</p><p style={{ fontSize: '13px', color: '#6B5B4E', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_message || 'Start chatting!'}</p></div>
        </div>
      ))}
    </div>
  )
}

// ==================== SEARCH TAB ====================
function SearchTab({ userId }: { userId: string }) {
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const SUBJECTS = ['A-Math', 'E-Math', 'H2 Math', 'H2 Physics', 'H2 Chemistry', 'H2 Biology', 'H2 Economics', 'English', 'General Paper', 'Chinese', 'Computing']

  useEffect(() => { load() }, [])
  async function load() {
    let sData: StudentData = { subjects: [], level: null, location_area: null, budget_min: null, budget_max: null, learning_style: null }
    const { data: p } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (p?.role === 'student') { const { data: sp } = await supabase.from('student_profiles').select('*').eq('id', userId).single(); if (sp) sData = sp }
    const { data: tp } = await supabase.from('profiles').select('id, full_name, bio').eq('role', 'tutor')
    if (tp) { const r: TutorWithProfile[] = []; for (const t of tp) { const { data: d } = await supabase.from('tutor_profiles').select('*').eq('id', t.id).single(); if (d) { const tutor: TutorWithProfile = { ...t, tutor_profile: d }; tutor.matchScore = calculateMatch(tutor, sData); r.push(tutor) } }; r.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)); setTutors(r) }
    setLoading(false)
  }
  async function startChat(tid: string) {
    if (startingChat) return; setStartingChat(tid)
    try { const { data: ex } = await supabase.from('conversations').select('id').eq('student_id', userId).eq('tutor_id', tid); if (!ex || ex.length === 0) await supabase.from('conversations').insert({ student_id: userId, tutor_id: tid }) } finally { setStartingChat(null) }
  }
  const filtered = tutors.filter(t => !filter || (t.tutor_profile.subjects || []).includes(filter))

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: '48px', marginBottom: '8px' }}>🦫</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Finding matches...</p></div>

  return (
    <div style={{ padding: '20px 16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'Nunito', marginBottom: '14px' }}>🎯 Find Tutors</h2>
      <div style={{ overflowX: 'auto', marginBottom: '16px', display: 'flex', gap: '6px', paddingBottom: '6px', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <button onClick={() => setFilter('')} style={{ padding: '7px 16px', borderRadius: '20px', border: 'none', background: !filter ? '#E67E22' : 'white', color: !filter ? 'white' : '#6B5B4E', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito', flexShrink: 0, boxShadow: !filter ? '0 2px 8px rgba(230,126,34,0.2)' : '0 1px 3px rgba(0,0,0,0.04)' }}>All</button>
        {SUBJECTS.map(s => <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 16px', borderRadius: '20px', border: 'none', background: filter === s ? '#E67E22' : 'white', color: filter === s ? 'white' : '#6B5B4E', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito', flexShrink: 0, whiteSpace: 'nowrap', boxShadow: filter === s ? '0 2px 8px rgba(230,126,34,0.2)' : '0 1px 3px rgba(0,0,0,0.04)' }}>{s}</button>)}
      </div>
      {filtered.map(tutor => (
        <div key={tutor.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8DFD4', marginBottom: '12px', boxShadow: '0 2px 8px rgba(139,105,20,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👩‍🏫</div>
              <div><h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, fontFamily: 'Nunito' }}>{tutor.full_name}</h3><p style={{ fontSize: '12px', color: '#6B5B4E', margin: '2px 0 0' }}>{tutor.tutor_profile.location_area} • {tutor.tutor_profile.experience_years || 0}yr exp</p></div>
            </div>
            <div style={{ padding: '5px 12px', borderRadius: '14px', fontWeight: 900, fontSize: '14px', color: 'white', fontFamily: 'Nunito', background: (tutor.matchScore || 0) >= 80 ? 'linear-gradient(135deg, #27AE60, #1E8449)' : (tutor.matchScore || 0) >= 60 ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : '#6B5B4E' }}>{tutor.matchScore}%</div>
          </div>
          {tutor.bio && <p style={{ fontSize: '13px', color: '#6B5B4E', lineHeight: 1.45, marginBottom: '10px' }}>{tutor.bio}</p>}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>{(tutor.tutor_profile.subjects || []).slice(0, 4).map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: '#FFF0DB', color: '#E67E22', fontFamily: 'Nunito' }}>{s}</span>)}</div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6B5B4E', marginBottom: '12px' }}><span style={{ fontWeight: 700 }}>⭐ {tutor.tutor_profile.rating.toFixed(1)}</span><span style={{ fontWeight: 700 }}>💰 S${tutor.tutor_profile.hourly_rate}/hr</span></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => startChat(tutor.id)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'Nunito', boxShadow: '0 2px 8px rgba(230,126,34,0.2)' }}>{startingChat === tutor.id ? '⏳' : '💬 Message'}</button>
            <Link href={'/booking?tutor=' + tutor.id} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '2px solid #E8DFD4', background: 'white', color: '#2C1810', fontWeight: 800, fontSize: '14px', fontFamily: 'Nunito', textAlign: 'center', textDecoration: 'none' }}>📅 Book</Link>
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '48px', marginBottom: '8px' }}>🦫</div><p style={{ fontWeight: 800, fontFamily: 'Nunito' }}>No tutors found</p></div>}
    </div>
  )
}

// ==================== PROFILE TAB ====================
function ProfileTab({ profile, studentProfile, tutorProfile, onSave, onLogout }: { profile: Profile; studentProfile: StudentProfile | null; tutorProfile: TutorProfileData | null; onSave: (p: Profile, sp: StudentProfile | null, tp: TutorProfileData | null) => void; onLogout: () => void }) {
  const [p, setP] = useState(profile)
  const [sp, setSp] = useState(studentProfile)
  const [tp, setTp] = useState(tutorProfile)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const SUBJECTS = ['A-Math', 'E-Math', 'H2 Math', 'H2 Physics', 'H2 Chemistry', 'H2 Biology', 'H2 Economics', 'English', 'General Paper', 'Chinese', 'Malay', 'Tamil', 'History', 'Geography', 'Literature', 'Computing']
  const AREAS = ['Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Timah', 'Clementi', 'Hougang', 'Jurong East', 'Jurong West', 'Kallang', 'Marine Parade', 'Pasir Ris', 'Punggol', 'Queenstown', 'Sengkang', 'Serangoon', 'Tampines', 'Toa Payoh', 'Woodlands', 'Yishun']
  const LEVELS = ['O-Level', 'A-Level', 'IP', 'IB']
  const subs = p.role === 'student' ? (sp?.subjects || []) : (tp?.subjects || [])
  const toggleSub = (s: string) => { if (p.role === 'student' && sp) { const c = sp.subjects || []; setSp({ ...sp, subjects: c.includes(s) ? c.filter(x => x !== s) : [...c, s] }) }; if (p.role === 'tutor' && tp) { const c = tp.subjects || []; setTp({ ...tp, subjects: c.includes(s) ? c.filter(x => x !== s) : [...c, s] }) } }
  const chip = (active: boolean) => ({ padding: '7px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 as const, background: active ? '#E67E22' : 'white', color: active ? 'white' : '#2C1810', border: active ? 'none' : '2px solid #E8DFD4', cursor: 'pointer' as const, fontFamily: 'Nunito', boxShadow: active ? '0 2px 8px rgba(230,126,34,0.2)' : 'none' })
  const inp = { width: '100%', padding: '11px 14px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '16px', background: 'white', color: '#2C1810', outline: 'none', fontFamily: 'Quicksand' }
  async function save() { setSaving(true); setMsg(''); await onSave(p, sp, tp); setMsg('Saved! 🦫'); setSaving(false); setTimeout(() => setMsg(''), 2000) }

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'Nunito' }}>{p.role === 'student' ? '🎓' : '👩‍🏫'} Profile</h2>
        <button onClick={onLogout} style={{ fontSize: '14px', color: '#E74C3C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito' }}>Log out</button>
      </div>
      {msg && <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', marginBottom: '14px', textAlign: 'center' }}><p style={{ fontSize: '14px', color: '#27AE60', fontWeight: 700, margin: 0, fontFamily: 'Nunito' }}>{msg}</p></div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Name</label><input style={inp} value={p.full_name} onChange={e => setP({ ...p, full_name: e.target.value })} /></div>
        <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>About</label><textarea rows={2} value={p.bio || ''} onChange={e => setP({ ...p, bio: e.target.value })} placeholder="Tell us about yourself..." style={{ ...inp, resize: 'none' as const }} /></div>
        {p.role === 'student' && sp && <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Level</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{LEVELS.map(l => <button key={l} type="button" onClick={() => setSp({ ...sp, level: l })} style={chip(sp.level === l)}>{l}</button>)}</div></div>}
        <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Subjects</label><div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{SUBJECTS.map(s => <button key={s} type="button" onClick={() => toggleSub(s)} style={chip(subs.includes(s))}>{s}</button>)}</div></div>
        <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Area</label><select style={inp} value={(p.role === 'student' ? sp?.location_area : tp?.location_area) || ''} onChange={e => { if (p.role === 'student' && sp) setSp({ ...sp, location_area: e.target.value }); if (p.role === 'tutor' && tp) setTp({ ...tp, location_area: e.target.value }) }}><option value="">Select area</option>{AREAS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
        {p.role === 'student' && sp && <div style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Min $/hr</label><input type="number" placeholder="25" style={inp} value={sp.budget_min || ''} onChange={e => setSp({ ...sp, budget_min: parseInt(e.target.value) || null })} /></div><div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Max $/hr</label><input type="number" placeholder="60" style={inp} value={sp.budget_max || ''} onChange={e => setSp({ ...sp, budget_max: parseInt(e.target.value) || null })} /></div></div>}
        {p.role === 'tutor' && tp && <div style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Rate S$/hr</label><input type="number" placeholder="45" style={inp} value={tp.hourly_rate || ''} onChange={e => setTp({ ...tp, hourly_rate: parseInt(e.target.value) || null })} /></div><div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', fontFamily: 'Nunito' }}>Years exp</label><input type="number" placeholder="2" style={inp} value={tp.experience_years || ''} onChange={e => setTp({ ...tp, experience_years: parseInt(e.target.value) || null })} /></div></div>}
        <button onClick={save} disabled={saving} style={{ padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '16px', fontFamily: 'Nunito', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(230,126,34,0.3)' }}>{saving ? '⏳' : '💾 Save Profile'}</button>
      </div>
    </div>
  )
}

// ==================== MAIN APP ====================
export default function AppShell() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [tutorProfile, setTutorProfile] = useState<TutorProfileData | null>(null)
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(2)

  // Swipe state using refs for zero-lag performance
  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchCurrentX = useRef(0)
  const isDragging = useRef(false)
  const isHorizontal = useRef<boolean | null>(null)
  const startTime = useRef(0)
  const activeTabRef = useRef(activeTab)

  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])

  const tabs = [
    { id: 0, icon: '📅', label: 'Bookings' },
    { id: 1, icon: '💬', label: 'Chat' },
    { id: 2, icon: '🔍', label: 'Search' },
    { id: 3, icon: '👤', label: 'Profile' },
  ]

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)
    const { data: pd } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (pd) {
      setProfile(pd)
      if (pd.role === 'student') { const { data } = await supabase.from('student_profiles').select('*').eq('id', session.user.id).single(); if (data) setStudentProfile(data) }
      else { const { data } = await supabase.from('tutor_profiles').select('*').eq('id', session.user.id).single(); if (data) setTutorProfile(data) }
    }
    const { data: bk } = await supabase.from('bookings').select('*').or('student_id.eq.' + session.user.id + ',tutor_id.eq.' + session.user.id).order('start_time', { ascending: true })
    if (bk) { const enriched: BookingType[] = []; for (const b of bk) { const oid = b.student_id === session.user.id ? b.tutor_id : b.student_id; const { data: op } = await supabase.from('profiles').select('full_name, role').eq('id', oid).single(); enriched.push({ ...b, other_name: op?.full_name || 'Unknown', other_role: op?.role || 'user' }) }; setBookings(enriched) }
    setLoading(false)
  }

  async function handleSaveProfile(p: Profile, sp: StudentProfile | null, tp: TutorProfileData | null) {
    await supabase.from('profiles').update({ full_name: p.full_name, bio: p.bio, updated_at: new Date().toISOString() }).eq('id', p.id)
    if (p.role === 'student' && sp) await supabase.from('student_profiles').update({ level: sp.level, subjects: sp.subjects, location_area: sp.location_area, budget_min: sp.budget_min, budget_max: sp.budget_max, learning_style: sp.learning_style }).eq('id', p.id)
    if (p.role === 'tutor' && tp) await supabase.from('tutor_profiles').update({ subjects: tp.subjects, levels: tp.levels, hourly_rate: tp.hourly_rate, location_area: tp.location_area, teaching_style: tp.teaching_style, experience_years: tp.experience_years, qualifications: tp.qualifications }).eq('id', p.id)
    setProfile(p); setStudentProfile(sp); setTutorProfile(tp)
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/') }

  // Direct DOM manipulation for buttery smooth swiping
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchCurrentX.current = e.touches[0].clientX
    isDragging.current = true
    isHorizontal.current = null
    startTime.current = Date.now()
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none'
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    const dx = x - touchStartX.current
    const dy = y - touchStartY.current

    // Determine direction on first significant movement
    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy)
      }
      return
    }

    if (!isHorizontal.current) return

    // Prevent vertical scrolling when swiping horizontally
    e.preventDefault()

    touchCurrentX.current = x
    const offset = dx
    const tabWidth = window.innerWidth
    const baseOffset = -activeTabRef.current * tabWidth

    // Add rubber-band resistance at edges
    let finalOffset = offset
    if ((activeTabRef.current === 0 && offset > 0) || (activeTabRef.current === 3 && offset < 0)) {
      finalOffset = offset * 0.2
    }

    if (sliderRef.current) {
      sliderRef.current.style.transform = `translate3d(${baseOffset + finalOffset}px, 0, 0)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !isHorizontal.current) {
      isDragging.current = false
      isHorizontal.current = null
      return
    }

    isDragging.current = false
    isHorizontal.current = null

    const dx = touchCurrentX.current - touchStartX.current
    const dt = Date.now() - startTime.current
    const velocity = Math.abs(dx) / dt // px per ms

    let newTab = activeTabRef.current

    // Fast swipe (velocity) or far enough drag
    if (velocity > 0.3 || Math.abs(dx) > window.innerWidth * 0.25) {
      if (dx > 0 && newTab > 0) newTab--
      if (dx < 0 && newTab < 3) newTab++
    }

    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)'
      sliderRef.current.style.transform = `translate3d(${-newTab * window.innerWidth}px, 0, 0)`
    }

    setActiveTab(newTab)
  }, [])

  // Update slider position when tab changes via button tap
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)'
      sliderRef.current.style.transform = `translate3d(${-activeTab * window.innerWidth}px, 0, 0)`
    }
  }, [activeTab])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'none'
        sliderRef.current.style.transform = `translate3d(${-activeTabRef.current * window.innerWidth}px, 0, 0)`
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '12px' }}>🦫</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Loading TutorMatch...</p></div></div>
  if (!profile || !userId) return null

  return (
    <div style={{ height: '100vh', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F5EDE3', background: '#FFF8F0', flexShrink: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🦫</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '17px', color: '#E67E22' }}>TutorMatch</span>
        </div>
        <span style={{ fontSize: '12px', color: '#6B5B4E', fontWeight: 600 }}>{profile.role === 'student' ? '🎓' : '👩‍🏫'} {profile.full_name.split(' ')[0]}</span>
      </div>

      {/* Swipeable content area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'pan-y' }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div ref={sliderRef} style={{
          display: 'flex',
          width: '400vw',
          height: '100%',
          transform: `translate3d(${-activeTab * 100}vw, 0, 0)`,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}>
          <div style={{ width: '100vw', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            <BookingTab userId={userId} bookings={bookings} onRefresh={loadAll} />
          </div>
          <div style={{ width: '100vw', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            <ChatTab userId={userId} />
          </div>
          <div style={{ width: '100vw', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            <SearchTab userId={userId} />
          </div>
          <div style={{ width: '100vw', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            <ProfileTab profile={profile} studentProfile={studentProfile} tutorProfile={tutorProfile} onSave={handleSaveProfile} onLogout={handleLogout} />
          </div>
        </div>
      </div>

      {/* Bottom tab bar with sliding indicator */}
      <div style={{ flexShrink: 0, background: 'white', borderTop: '1px solid #F5EDE3', zIndex: 30, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: `${activeTab * 25}%`, width: '25%', height: '2px', background: '#E67E22', transition: 'left 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0 env(safe-area-inset-bottom, 8px)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 16px', WebkitTapHighlightColor: 'transparent' }}>
              <span style={{ fontSize: '22px', transition: 'transform 0.2s', transform: activeTab === tab.id ? 'scale(1.15)' : 'scale(1)' }}>{tab.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'Nunito', color: activeTab === tab.id ? '#E67E22' : '#A0937E', transition: 'color 0.2s' }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
