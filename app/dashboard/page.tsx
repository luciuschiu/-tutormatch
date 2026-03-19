'use client'

import { useState, useEffect, useRef } from 'react'
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
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Nunito', marginBottom: '16px' }}>📅 Bookings</h2>
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: '56px', marginBottom: '12px' }}>📅</div><p style={{ fontWeight: 800, fontFamily: 'Nunito', color: '#6B5B4E', fontSize: '16px' }}>No bookings yet</p><p style={{ color: '#A0937E', fontSize: '14px', marginTop: '4px' }}>Find a tutor and book a lesson!</p></div>
      ) : bookings.map(b => { const s = statusStyle(b.status); const d = new Date(b.start_time); const isOwner = b.student_id === userId; return (
        <div key={b.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8DFD4', marginBottom: '10px' }}>
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
            {b.status === 'pending' && !isOwner && <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#27AE60', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito' }}>✅ Confirm</button>}
            {(b.status === 'pending' || b.status === 'confirmed') && <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #FCA5A5', background: 'white', color: '#DC2626', fontWeight: 800, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito' }}>Cancel</button>}
            {b.status === 'confirmed' && isOwner && <button onClick={() => updateStatus(b.id, 'completed')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#E67E22', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito' }}>🎓 Complete</button>}
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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5EDE3', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button onClick={() => setActiveConvo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px' }}>←</button>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{activeConvo.other_role === 'tutor' ? '👩‍🏫' : '🎓'}</div>
        <p style={{ fontWeight: 800, fontSize: '15px', fontFamily: 'Nunito', margin: 0 }}>{activeConvo.other_name}</p>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {messages.length === 0 && <p style={{ textAlign: 'center', color: '#6B5B4E', padding: '40px 0' }}>Say hello! 👋</p>}
        {messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.sender_id === userId ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ padding: '10px 14px', borderRadius: m.sender_id === userId ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: m.sender_id === userId ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : '#F5EDE3', color: m.sender_id === userId ? 'white' : '#2C1810', fontSize: '14px', lineHeight: 1.4 }}>{m.content}</div>
            <p style={{ fontSize: '10px', color: '#A0937E', marginTop: '2px', textAlign: m.sender_id === userId ? 'right' : 'left' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={send} style={{ padding: '10px 12px', borderTop: '1px solid #F5EDE3', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '16px', outline: 'none', background: 'white', color: '#2C1810', fontFamily: 'Quicksand' }} />
        <button type="submit" style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'Nunito' }}>Send</button>
      </form>
    </div>
  )

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Nunito', marginBottom: '16px' }}>💬 Messages</h2>
      {!loaded ? <p style={{ textAlign: 'center', color: '#E67E22', fontWeight: 700, fontFamily: 'Nunito' }}>Loading...</p> :
      conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: '56px', marginBottom: '12px' }}>🦫</div><p style={{ fontWeight: 800, fontFamily: 'Nunito', color: '#6B5B4E', fontSize: '16px' }}>No conversations yet</p><p style={{ color: '#A0937E', fontSize: '14px', marginTop: '4px' }}>Find a tutor to start chatting!</p></div>
      ) : conversations.map(c => (
        <div key={c.id} onClick={() => openConvo(c)} style={{ padding: '14px', cursor: 'pointer', borderBottom: '1px solid #F5EDE3', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{c.other_role === 'tutor' ? '👩‍🏫' : '🎓'}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}><p style={{ fontWeight: 800, fontSize: '15px', fontFamily: 'Nunito', margin: 0 }}>{c.other_name}</p><p style={{ fontSize: '13px', color: '#6B5B4E', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_message || 'Start chatting!'}</p></div>
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
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Nunito', marginBottom: '12px' }}>🎯 Find Tutors</h2>
      <div style={{ overflowX: 'auto', marginBottom: '16px', display: 'flex', gap: '6px', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
        <button onClick={() => setFilter('')} style={{ padding: '6px 14px', borderRadius: '10px', border: 'none', background: !filter ? '#E67E22' : 'white', color: !filter ? 'white' : '#6B5B4E', fontWeight: 700, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito', flexShrink: 0 }}>All</button>
        {SUBJECTS.map(s => <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: '10px', border: 'none', background: filter === s ? '#E67E22' : 'white', color: filter === s ? 'white' : '#6B5B4E', fontWeight: 700, cursor: 'pointer', fontSize: '12px', fontFamily: 'Nunito', flexShrink: 0, whiteSpace: 'nowrap' }}>{s}</button>)}
      </div>
      {filtered.map(tutor => (
        <div key={tutor.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8DFD4', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👩‍🏫</div>
              <div><h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, fontFamily: 'Nunito' }}>{tutor.full_name}</h3><p style={{ fontSize: '12px', color: '#6B5B4E', margin: '2px 0 0' }}>{tutor.tutor_profile.location_area} • {tutor.tutor_profile.experience_years || 0}yr</p></div>
            </div>
            <div style={{ padding: '4px 10px', borderRadius: '14px', fontWeight: 900, fontSize: '13px', color: 'white', fontFamily: 'Nunito', background: (tutor.matchScore || 0) >= 80 ? 'linear-gradient(135deg, #27AE60, #1E8449)' : (tutor.matchScore || 0) >= 60 ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : '#6B5B4E' }}>{tutor.matchScore}%</div>
          </div>
          {tutor.bio && <p style={{ fontSize: '13px', color: '#6B5B4E', lineHeight: 1.4, marginBottom: '8px' }}>{tutor.bio}</p>}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>{(tutor.tutor_profile.subjects || []).slice(0, 4).map(s => <span key={s} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#FFF0DB', color: '#E67E22', fontFamily: 'Nunito' }}>{s}</span>)}</div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6B5B4E', marginBottom: '10px' }}><span style={{ fontWeight: 700 }}>⭐ {tutor.tutor_profile.rating.toFixed(1)}</span><span style={{ fontWeight: 700 }}>💰 S${tutor.tutor_profile.hourly_rate}/hr</span></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => startChat(tutor.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito' }}>{startingChat === tutor.id ? '⏳' : '💬 Message'}</button>
            <Link href={'/booking?tutor=' + tutor.id} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #E8DFD4', background: 'white', color: '#2C1810', fontWeight: 800, fontSize: '13px', fontFamily: 'Nunito', textAlign: 'center', textDecoration: 'none' }}>📅 Book</Link>
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
  const selectedSubjects = p.role === 'student' ? (sp?.subjects || []) : (tp?.subjects || [])
  const toggleSubject = (s: string) => { if (p.role === 'student' && sp) { const c = sp.subjects || []; setSp({ ...sp, subjects: c.includes(s) ? c.filter(x => x !== s) : [...c, s] }) }; if (p.role === 'tutor' && tp) { const c = tp.subjects || []; setTp({ ...tp, subjects: c.includes(s) ? c.filter(x => x !== s) : [...c, s] }) } }
  const chip = (active: boolean) => ({ padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 as const, background: active ? '#E67E22' : 'white', color: active ? 'white' : '#2C1810', border: active ? 'none' : '2px solid #E8DFD4', cursor: 'pointer' as const, fontFamily: 'Nunito' })
  const inp = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #E8DFD4', fontSize: '16px', background: 'white', color: '#2C1810', outline: 'none', fontFamily: 'Quicksand' }
  async function save() { setSaving(true); setMsg(''); await onSave(p, sp, tp); setMsg('Saved! 🦫'); setSaving(false); setTimeout(() => setMsg(''), 2000) }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Nunito' }}>{p.role === 'student' ? '🎓' : '👩‍🏫'} Profile</h2>
        <button onClick={onLogout} style={{ fontSize: '13px', color: '#E74C3C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito' }}>Log out</button>
      </div>
      {msg && <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', marginBottom: '12px', textAlign: 'center' }}><p style={{ fontSize: '13px', color: '#27AE60', fontWeight: 700, margin: 0, fontFamily: 'Nunito' }}>{msg}</p></div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Name</label><input style={inp} value={p.full_name} onChange={e => setP({ ...p, full_name: e.target.value })} /></div>
        <div><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>About</label><textarea rows={2} value={p.bio || ''} onChange={e => setP({ ...p, bio: e.target.value })} placeholder="Tell us about yourself..." style={{ ...inp, resize: 'none' as const }} /></div>
        {p.role === 'student' && sp && <div><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Level</label><div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{LEVELS.map(l => <button key={l} type="button" onClick={() => setSp({ ...sp, level: l })} style={chip(sp.level === l)}>{l}</button>)}</div></div>}
        <div><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Subjects</label><div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{SUBJECTS.map(s => <button key={s} type="button" onClick={() => toggleSubject(s)} style={chip(selectedSubjects.includes(s))}>{s}</button>)}</div></div>
        <div><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Area</label><select style={inp} value={(p.role === 'student' ? sp?.location_area : tp?.location_area) || ''} onChange={e => { if (p.role === 'student' && sp) setSp({ ...sp, location_area: e.target.value }); if (p.role === 'tutor' && tp) setTp({ ...tp, location_area: e.target.value }) }}><option value="">Select area</option>{AREAS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
        {p.role === 'student' && sp && <div style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1 }}><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Min $/hr</label><input type="number" placeholder="25" style={inp} value={sp.budget_min || ''} onChange={e => setSp({ ...sp, budget_min: parseInt(e.target.value) || null })} /></div><div style={{ flex: 1 }}><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Max $/hr</label><input type="number" placeholder="60" style={inp} value={sp.budget_max || ''} onChange={e => setSp({ ...sp, budget_max: parseInt(e.target.value) || null })} /></div></div>}
        {p.role === 'tutor' && tp && <div style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1 }}><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Rate S$/hr</label><input type="number" placeholder="45" style={inp} value={tp.hourly_rate || ''} onChange={e => setTp({ ...tp, hourly_rate: parseInt(e.target.value) || null })} /></div><div style={{ flex: 1 }}><label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', fontFamily: 'Nunito' }}>Years exp</label><input type="number" placeholder="2" style={inp} value={tp.experience_years || ''} onChange={e => setTp({ ...tp, experience_years: parseInt(e.target.value) || null })} /></div></div>}
        <button onClick={save} disabled={saving} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'Nunito', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 12px rgba(230,126,34,0.3)' }}>{saving ? '⏳' : '💾 Save'}</button>
      </div>
    </div>
  )
}

// ==================== MAIN APP WITH SMOOTH SLIDE ====================
export default function AppShell() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [tutorProfile, setTutorProfile] = useState<TutorProfileData | null>(null)
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(2)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontal = useRef<boolean | null>(null)

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

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontal.current = null
    setIsDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy)
      }
      return
    }

    if (!isHorizontal.current) return

    const maxDrag = window.innerWidth * 0.8
    const clamped = Math.max(-maxDrag, Math.min(maxDrag, dx))
    setDragOffset(clamped)
  }

  function onTouchEnd() {
    setIsDragging(false)
    if (isHorizontal.current && Math.abs(dragOffset) > 60) {
      if (dragOffset > 0 && activeTab > 0) setActiveTab(activeTab - 1)
      if (dragOffset < 0 && activeTab < 3) setActiveTab(activeTab + 1)
    }
    setDragOffset(0)
    isHorizontal.current = null
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '12px' }}>🦫</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Loading TutorMatch...</p></div></div>
  if (!profile || !userId) return null

  const slideX = -activeTab * 100

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F5EDE3', background: '#FFF8F0', flexShrink: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🦫</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '17px', color: '#E67E22' }}>TutorMatch</span>
        </div>
        <span style={{ fontSize: '12px', color: '#6B5B4E', fontWeight: 600 }}>{profile.role === 'student' ? '🎓' : '👩‍🏫'} {profile.full_name.split(' ')[0]}</span>
      </div>

      {/* Sliding content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div style={{
          display: 'flex',
          width: '400%',
          height: '100%',
          transform: `translateX(calc(${slideX}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform'
        }}>
          <div style={{ width: '25%', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <BookingTab userId={userId} bookings={bookings} onRefresh={loadAll} />
          </div>
          <div style={{ width: '25%', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <ChatTab userId={userId} />
          </div>
          <div style={{ width: '25%', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <SearchTab userId={userId} />
          </div>
          <div style={{ width: '25%', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <ProfileTab profile={profile} studentProfile={studentProfile} tutorProfile={tutorProfile} onSave={handleSaveProfile} onLogout={handleLogout} />
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div style={{ flexShrink: 0, background: 'white', borderTop: '1px solid #F5EDE3', display: 'flex', justifyContent: 'space-around', padding: '6px 0 env(safe-area-inset-bottom, 6px)', zIndex: 30 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', padding: '4px 16px', WebkitTapHighlightColor: 'transparent', transition: 'transform 0.2s' }}>
            <span style={{ fontSize: '20px', transition: 'transform 0.2s', transform: activeTab === tab.id ? 'scale(1.15)' : 'scale(1)' }}>{tab.icon}</span>
            <span style={{ fontSize: '9px', fontWeight: 800, fontFamily: 'Nunito', color: activeTab === tab.id ? '#E67E22' : '#A0937E' }}>{tab.label}</span>
            {activeTab === tab.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#E67E22' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
