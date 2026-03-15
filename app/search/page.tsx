'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type TutorWithProfile = {
  id: string
  full_name: string
  bio: string | null
  tutor_profile: {
    subjects: string[]
    levels: string[]
    hourly_rate: number | null
    location_area: string | null
    teaching_style: string | null
    experience_years: number | null
    qualifications: string | null
    rating: number
    total_reviews: number
  }
  matchScore?: number
}

type StudentData = {
  subjects: string[]
  level: string | null
  location_area: string | null
  budget_min: number | null
  budget_max: number | null
  learning_style: string | null
}

function calculateMatch(tutor: TutorWithProfile, student: StudentData): number {
  let score = 0

  const tutorSubjects = tutor.tutor_profile.subjects || []
  const studentSubjects = student.subjects || []
  if (studentSubjects.length > 0 && tutorSubjects.length > 0) {
    const overlap = studentSubjects.filter(s => tutorSubjects.includes(s)).length
    score += 25 * (overlap / studentSubjects.length)
  } else {
    score += 12
  }

  const tutorLevels = tutor.tutor_profile.levels || []
  if (student.level && tutorLevels.includes(student.level)) {
    score += 15
  } else if (!student.level) {
    score += 7
  }

  if (student.location_area && tutor.tutor_profile.location_area) {
    if (student.location_area === tutor.tutor_profile.location_area) {
      score += 15
    } else {
      score += 4
    }
  } else {
    score += 7
  }

  const rate = tutor.tutor_profile.hourly_rate
  if (rate && student.budget_max) {
    if (rate <= student.budget_max && rate >= (student.budget_min || 0)) {
      score += 12
    } else if (rate <= student.budget_max * 1.2) {
      score += 6
    }
  } else {
    score += 6
  }

  const rating = tutor.tutor_profile.rating || 0
  score += 10 * (rating / 5)

  if (student.learning_style && tutor.tutor_profile.teaching_style) {
    if (student.learning_style === tutor.tutor_profile.teaching_style) {
      score += 8
    } else {
      score += 2
    }
  } else {
    score += 4
  }

  const exp = tutor.tutor_profile.experience_years || 0
  score += 10 * Math.min(exp / 5, 1)

  const reviews = tutor.tutor_profile.total_reviews || 0
  score += 5 * Math.min(reviews / 30, 1)

  return Math.round(score)
}

export default function SearchPage() {
  const router = useRouter()
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const SUBJECTS = ['A-Math', 'E-Math', 'H2 Math', 'H2 Physics', 'H2 Chemistry', 'H2 Biology', 'H2 Economics', 'English', 'General Paper', 'Chinese', 'Malay', 'Tamil', 'History', 'Geography', 'Literature', 'Computing']
  const AREAS = ['Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Timah', 'Clementi', 'Hougang', 'Jurong East', 'Jurong West', 'Kallang', 'Marine Parade', 'Pasir Ris', 'Punggol', 'Queenstown', 'Sengkang', 'Serangoon', 'Tampines', 'Toa Payoh', 'Woodlands', 'Yishun']

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    let sData: StudentData = { subjects: [], level: null, location_area: null, budget_min: null, budget_max: null, learning_style: null }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUserId(session.user.id)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile && profile.role === 'student') {
        const { data: sp } = await supabase.from('student_profiles').select('*').eq('id', session.user.id).single()
        if (sp) sData = sp
      }
    }

    const { data: tutorProfiles } = await supabase.from('profiles').select('id, full_name, bio').eq('role', 'tutor')

    if (tutorProfiles) {
      const results: TutorWithProfile[] = []
      for (const tp of tutorProfiles) {
        const { data: details } = await supabase.from('tutor_profiles').select('*').eq('id', tp.id).single()
        if (details) {
          const tutor: TutorWithProfile = { ...tp, tutor_profile: details }
          tutor.matchScore = calculateMatch(tutor, sData)
          results.push(tutor)
        }
      }
      results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      setTutors(results)
    }
    setLoading(false)
  }

  async function startChat(tutorId: string) {
    if (!userId) { router.push('/auth'); return }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('student_id', userId)
      .eq('tutor_id', tutorId)
      .single()

    if (existing) {
      router.push('/chat')
      return
    }

    await supabase.from('conversations').insert({
      student_id: userId,
      tutor_id: tutorId
    })

    router.push('/chat')
  }

  const filtered = tutors.filter(t => {
    if (subjectFilter && !(t.tutor_profile.subjects || []).includes(subjectFilter)) return false
    if (areaFilter && t.tutor_profile.location_area !== areaFilter) return false
    if (maxPrice && t.tutor_profile.hourly_rate && t.tutor_profile.hourly_rate > parseInt(maxPrice)) return false
    return true
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF5', color: '#1A1A2E', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🦦</div>
          <p style={{ fontWeight: 700, color: '#7C3AED' }}>Finding your best matches...</p>
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
          <Link href="/chat" style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>💬 Chat</Link>
          <Link href="/dashboard" style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>🎯 Find Your Perfect Tutor</h1>
          <p style={{ color: '#64748B' }}>Ranked by compatibility with your profile</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }}>
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }}>
            <option value="">All Areas</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="number" placeholder="Max $/hr" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', width: '120px', background: 'white', color: '#1A1A2E' }} />
        </div>

        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>{filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(tutor => (
            <div key={tutor.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👩‍🏫</div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{tutor.full_name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>{tutor.tutor_profile.location_area || 'Singapore'} • {tutor.tutor_profile.experience_years || 0} yrs exp</p>
                  </div>
                </div>
                <div style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '15px', color: 'white', background: (tutor.matchScore || 0) >= 80 ? 'linear-gradient(135deg, #10B981, #059669)' : (tutor.matchScore || 0) >= 60 ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #64748B, #475569)' }}>
                  {tutor.matchScore}% match
                </div>
              </div>

              {tutor.bio && <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '12px' }}>{tutor.bio}</p>}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {(tutor.tutor_profile.subjects || []).map(s => (
                  <span key={s} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: '#F3E8FF', color: '#7C3AED' }}>{s}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>⭐ {tutor.tutor_profile.rating.toFixed(1)} ({tutor.tutor_profile.total_reviews} reviews)</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>💰 S${tutor.tutor_profile.hourly_rate}/hr</span>
                <span style={{ fontSize: '14px' }}>📚 {(tutor.tutor_profile.levels || []).join(', ')}</span>
                {tutor.tutor_profile.teaching_style && <span style={{ fontSize: '14px' }}>🎯 {tutor.tutor_profile.teaching_style}</span>}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => startChat(tutor.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#7C3AED', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>💬 Message</button>
                <button style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #E2E8F0', background: 'white', color: '#1A1A2E', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>📅 Book Lesson</button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🦦</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No tutors match your filters</h3>
            <p style={{ color: '#64748B' }}>Try widening your search!</p>
          </div>
        )}
      </div>
    </div>
  )
}
