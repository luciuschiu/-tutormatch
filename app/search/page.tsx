'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type TutorWithProfile = { id: string; full_name: string; bio: string | null; tutor_profile: { subjects: string[]; levels: string[]; hourly_rate: number | null; location_area: string | null; teaching_style: string | null; experience_years: number | null; qualifications: string | null; rating: number; total_reviews: number }; matchScore?: number }
type StudentData = { subjects: string[]; level: string | null; location_area: string | null; budget_min: number | null; budget_max: number | null; learning_style: string | null }

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

export default function SearchPage() {
  const router = useRouter()
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const SUBJECTS = ['A-Math', 'E-Math', 'H2 Math', 'H2 Physics', 'H2 Chemistry', 'H2 Biology', 'H2 Economics', 'English', 'General Paper', 'Chinese', 'Malay', 'Tamil', 'History', 'Geography', 'Literature', 'Computing']
  const AREAS = ['Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Timah', 'Clementi', 'Hougang', 'Jurong East', 'Jurong West', 'Kallang', 'Marine Parade', 'Pasir Ris', 'Punggol', 'Queenstown', 'Sengkang', 'Serangoon', 'Tampines', 'Toa Payoh', 'Woodlands', 'Yishun']

  useEffect(() => { loadData() }, [])
  async function loadData() {
    let sData: StudentData = { subjects: [], level: null, location_area: null, budget_min: null, budget_max: null, learning_style: null }
    const { data: { session } } = await supabase.auth.getSession()
    if (session) { setUserId(session.user.id); const { data: p } = await supabase.from('profiles').select('role').eq('id', session.user.id).single(); if (p?.role === 'student') { const { data: sp } = await supabase.from('student_profiles').select('*').eq('id', session.user.id).single(); if (sp) sData = sp } }
    const { data: tp } = await supabase.from('profiles').select('id, full_name, bio').eq('role', 'tutor')
    if (tp) { const r: TutorWithProfile[] = []; for (const t of tp) { const { data: d } = await supabase.from('tutor_profiles').select('*').eq('id', t.id).single(); if (d) { const tutor: TutorWithProfile = { ...t, tutor_profile: d }; tutor.matchScore = calculateMatch(tutor, sData); r.push(tutor) } }; r.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)); setTutors(r) }
    setLoading(false)
  }
  async function startChat(tutorId: string) {
    if (!userId) { router.push('/auth'); return }; if (startingChat) return; setStartingChat(tutorId)
    try { const { data: ex } = await supabase.from('conversations').select('id').eq('student_id', userId).eq('tutor_id', tutorId); if (ex && ex.length > 0) { router.push('/chat'); return }; await supabase.from('conversations').insert({ student_id: userId, tutor_id: tutorId }); router.push('/chat') } finally { setStartingChat(null) }
  }
  const filtered = tutors.filter(t => { if (subjectFilter && !(t.tutor_profile.subjects || []).includes(subjectFilter)) return false; if (areaFilter && t.tutor_profile.location_area !== areaFilter) return false; if (maxPrice && t.tutor_profile.hourly_rate && t.tutor_profile.hourly_rate > parseInt(maxPrice)) return false; return true })
  const I = { select: { padding: '10px 14px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '14px', background: 'white', color: '#2C1810', fontFamily: 'Quicksand' } }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '16px' }}>🦫</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Finding your best matches...</p></div></div>

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#2C1810' }}><span style={{ fontSize: '24px' }}>🦫</span><span style={{ fontWeight: 900, fontSize: '18px', color: '#E67E22', fontFamily: 'Nunito' }}>TutorMatch</span></Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/booking" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>📅 Bookings</Link>
          <Link href="/chat" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>💬 Chat</Link>
          <Link href="/dashboard" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>← Dashboard</Link>
        </div>
      </nav>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}><h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', fontFamily: 'Nunito' }}>🎯 Find Your Perfect Tutor</h1><p style={{ color: '#6B5B4E' }}>Ranked by compatibility with your profile</p></div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={I.select}><option value="">All Subjects</option>{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} style={I.select}><option value="">All Areas</option>{AREAS.map(a => <option key={a} value={a}>{a}</option>)}</select>
          <input type="number" placeholder="Max $/hr" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ ...I.select, width: '120px' }} />
        </div>
        <p style={{ fontSize: '14px', color: '#6B5B4E', marginBottom: '16px' }}>{filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(tutor => (
            <div key={tutor.id} style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #E8DFD4', boxShadow: '0 4px 16px rgba(139,105,20,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👩‍🏫</div>
                  <div><h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, fontFamily: 'Nunito' }}>{tutor.full_name}</h3><p style={{ fontSize: '13px', color: '#6B5B4E', margin: '2px 0 0' }}>{tutor.tutor_profile.location_area || 'Singapore'} • {tutor.tutor_profile.experience_years || 0} yrs exp</p></div>
                </div>
                <div style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 900, fontSize: '15px', color: 'white', fontFamily: 'Nunito', background: (tutor.matchScore || 0) >= 80 ? 'linear-gradient(135deg, #27AE60, #1E8449)' : (tutor.matchScore || 0) >= 60 ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : 'linear-gradient(135deg, #6B5B4E, #5D4E37)' }}>{tutor.matchScore}%</div>
              </div>
              {tutor.bio && <p style={{ fontSize: '14px', color: '#6B5B4E', lineHeight: 1.5, marginBottom: '12px' }}>{tutor.bio}</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>{(tutor.tutor_profile.subjects || []).map(s => <span key={s} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: '#FFF0DB', color: '#E67E22', fontFamily: 'Nunito' }}>{s}</span>)}</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ fontWeight: 700 }}>⭐ {tutor.tutor_profile.rating.toFixed(1)} ({tutor.tutor_profile.total_reviews})</span>
                <span style={{ fontWeight: 700 }}>💰 S${tutor.tutor_profile.hourly_rate}/hr</span>
                <span>📚 {(tutor.tutor_profile.levels || []).join(', ')}</span>
                {tutor.tutor_profile.teaching_style && <span>🎯 {tutor.tutor_profile.teaching_style}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => startChat(tutor.id)} disabled={startingChat === tutor.id} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: startingChat === tutor.id ? '#F5B041' : 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: startingChat === tutor.id ? 'wait' : 'pointer', fontSize: '14px', fontFamily: 'Nunito', boxShadow: '0 2px 8px rgba(230,126,34,0.2)' }}>{startingChat === tutor.id ? '⏳ Opening...' : '💬 Message'}</button>
                <button onClick={() => router.push('/booking?tutor=' + tutor.id)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '2px solid #E8DFD4', background: 'white', color: '#2C1810', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'Nunito' }}>📅 Book Lesson</button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>🦫</div><h3 style={{ fontWeight: 800, marginBottom: '8px', fontFamily: 'Nunito' }}>No tutors match your filters</h3><p style={{ color: '#6B5B4E' }}>Try widening your search!</p></div>}
      </div>
    </div>
  )
}
