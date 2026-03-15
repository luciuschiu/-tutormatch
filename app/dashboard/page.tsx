'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Profile = { id: string; full_name: string; role: string; bio: string | null; avatar_url: string | null }
type StudentProfile = { level: string | null; subjects: string[]; location_area: string | null; budget_min: number | null; budget_max: number | null; learning_style: string | null }
type TutorProfile = { subjects: string[]; levels: string[]; hourly_rate: number | null; location_area: string | null; teaching_style: string | null; experience_years: number | null; qualifications: string | null; rating: number; total_reviews: number }

const SUBJECTS = ['A-Math', 'E-Math', 'H2 Math', 'H2 Physics', 'H2 Chemistry', 'H2 Biology', 'H2 Economics', 'English', 'General Paper', 'Chinese', 'Malay', 'Tamil', 'History', 'Geography', 'Literature', 'Computing']
const AREAS = ['Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Timah', 'Clementi', 'Hougang', 'Jurong East', 'Jurong West', 'Kallang', 'Marine Parade', 'Pasir Ris', 'Punggol', 'Queenstown', 'Sengkang', 'Serangoon', 'Tampines', 'Toa Payoh', 'Woodlands', 'Yishun']
const LEVELS = ['O-Level', 'A-Level', 'IP', 'IB']
const STYLES = ['visual', 'practice', 'discussion', 'structured']

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (profileData) {
      setProfile(profileData)
      if (profileData.role === 'student') {
        const { data } = await supabase.from('student_profiles').select('*').eq('id', session.user.id).single()
        if (data) setStudentProfile(data)
      } else {
        const { data } = await supabase.from('tutor_profiles').select('*').eq('id', session.user.id).single()
        if (data) setTutorProfile(data)
      }
    }
    setLoading(false)
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    setMessage('')
    await supabase.from('profiles').update({ full_name: profile.full_name, bio: profile.bio, updated_at: new Date().toISOString() }).eq('id', profile.id)
    if (profile.role === 'student' && studentProfile) {
      await supabase.from('student_profiles').update({ level: studentProfile.level, subjects: studentProfile.subjects, location_area: studentProfile.location_area, budget_min: studentProfile.budget_min, budget_max: studentProfile.budget_max, learning_style: studentProfile.learning_style }).eq('id', profile.id)
    }
    if (profile.role === 'tutor' && tutorProfile) {
      await supabase.from('tutor_profiles').update({ subjects: tutorProfile.subjects, levels: tutorProfile.levels, hourly_rate: tutorProfile.hourly_rate, location_area: tutorProfile.location_area, teaching_style: tutorProfile.teaching_style, experience_years: tutorProfile.experience_years, qualifications: tutorProfile.qualifications }).eq('id', profile.id)
    }
    setMessage('Profile saved! 🦦')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/') }

  function toggleSubject(subject: string) {
    if (profile?.role === 'student' && studentProfile) {
      const current = studentProfile.subjects || []
      setStudentProfile({ ...studentProfile, subjects: current.includes(subject) ? current.filter(s => s !== subject) : [...current, subject] })
    }
    if (profile?.role === 'tutor' && tutorProfile) {
      const current = tutorProfile.subjects || []
      setTutorProfile({ ...tutorProfile, subjects: current.includes(subject) ? current.filter(s => s !== subject) : [...current, subject] })
    }
  }

  function toggleLevel(level: string) {
    if (tutorProfile) {
      const current = tutorProfile.levels || []
      setTutorProfile({ ...tutorProfile, levels: current.includes(level) ? current.filter(l => l !== level) : [...current, level] })
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF5', color: '#1A1A2E', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🦦</div>
          <p style={{ fontWeight: 700, color: '#7C3AED' }}>Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null
  const selectedSubjects = profile.role === 'student' ? (studentProfile?.subjects || []) : (tutorProfile?.subjects || [])

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF5', color: '#1A1A2E', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#1A1A2E' }}>
          <span style={{ fontSize: '24px' }}>🦦</span>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#7C3AED' }}>TutorMatch</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#64748B' }}>{profile.role === 'student' ? '🎓' : '👩‍🏫'} {profile.full_name}</span>
          <button onClick={handleLogout} style={{ fontSize: '13px', color: '#F65868', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>{profile.role === 'student' ? '🎓' : '👩‍🏫'}</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Welcome, {profile.full_name.split(' ')[0]}!</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>{profile.role === 'student' ? 'Find your perfect tutor match' : 'Manage your tutoring profile'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <Link href="/search" style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textDecoration: 'none', color: '#1A1A2E', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🔍</div>
            <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Find Tutors</p>
          </Link>
          <Link href="/chat" style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textDecoration: 'none', color: '#1A1A2E', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>💬</div>
            <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Messages</p>
          </Link>
          <Link href="/booking" style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textDecoration: 'none', color: '#1A1A2E', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>📅</div>
            <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Bookings</p>
          </Link>
        </div>

        {message && (
          <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ fontSize: '14px', color: '#10B981', fontWeight: 600, margin: 0 }}>{message}</p>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>{profile.role === 'student' ? '🎓 Student Profile' : '👩‍🏫 Tutor Profile'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E', outline: 'none' }} value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>About Me</label>
              <textarea rows={3} placeholder={profile.role === 'student' ? 'What are you looking for in a tutor?' : 'Tell students about your teaching approach...'} value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', resize: 'none', background: 'white', color: '#1A1A2E', outline: 'none' }} />
            </div>
            {profile.role === 'student' && studentProfile && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Level</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {LEVELS.map(level => (<button key={level} type="button" onClick={() => setStudentProfile({ ...studentProfile, level })} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: studentProfile.level === level ? '#7C3AED' : 'white', color: studentProfile.level === level ? 'white' : '#1A1A2E', border: studentProfile.level === level ? 'none' : '2px solid #E2E8F0', cursor: 'pointer' }}>{level}</button>))}
                </div>
              </div>
            )}
            {profile.role === 'tutor' && tutorProfile && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Levels You Teach</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {LEVELS.map(level => (<button key={level} type="button" onClick={() => toggleLevel(level)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: (tutorProfile.levels || []).includes(level) ? '#32D0C9' : 'white', color: (tutorProfile.levels || []).includes(level) ? 'white' : '#1A1A2E', border: (tutorProfile.levels || []).includes(level) ? 'none' : '2px solid #E2E8F0', cursor: 'pointer' }}>{level}</button>))}
                </div>
              </div>
            )}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{profile.role === 'student' ? 'Subjects You Need Help With' : 'Subjects You Teach'}</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SUBJECTS.map(subject => (<button key={subject} type="button" onClick={() => toggleSubject(subject)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: selectedSubjects.includes(subject) ? '#7C3AED' : 'white', color: selectedSubjects.includes(subject) ? 'white' : '#1A1A2E', border: selectedSubjects.includes(subject) ? 'none' : '2px solid #E2E8F0', cursor: 'pointer' }}>{subject}</button>))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Area</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }} value={(profile.role === 'student' ? studentProfile?.location_area : tutorProfile?.location_area) || ''} onChange={e => { if (profile.role === 'student' && studentProfile) setStudentProfile({ ...studentProfile, location_area: e.target.value }); if (profile.role === 'tutor' && tutorProfile) setTutorProfile({ ...tutorProfile, location_area: e.target.value }) }}>
                <option value="">Select your area</option>
                {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            {profile.role === 'student' && studentProfile && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Min Budget ($/hr)</label><input type="number" placeholder="25" value={studentProfile.budget_min || ''} onChange={e => setStudentProfile({ ...studentProfile, budget_min: parseInt(e.target.value) || null })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Max Budget ($/hr)</label><input type="number" placeholder="60" value={studentProfile.budget_max || ''} onChange={e => setStudentProfile({ ...studentProfile, budget_max: parseInt(e.target.value) || null })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }} /></div>
              </div>
            )}
            {profile.role === 'tutor' && tutorProfile && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Hourly Rate (S$)</label><input type="number" placeholder="45" value={tutorProfile.hourly_rate || ''} onChange={e => setTutorProfile({ ...tutorProfile, hourly_rate: parseInt(e.target.value) || null })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Years Experience</label><input type="number" placeholder="2" value={tutorProfile.experience_years || ''} onChange={e => setTutorProfile({ ...tutorProfile, experience_years: parseInt(e.target.value) || null })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', background: 'white', color: '#1A1A2E' }} /></div>
              </div>
            )}
            {profile.role === 'tutor' && tutorProfile && (
              <div><label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Qualifications</label><textarea rows={2} placeholder="e.g. NUS Computer Science Year 3, A-Level 4H2 90RP" value={tutorProfile.qualifications || ''} onChange={e => setTutorProfile({ ...tutorProfile, qualifications: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '14px', resize: 'none', background: 'white', color: '#1A1A2E' }} /></div>
            )}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{profile.role === 'student' ? 'How Do You Learn Best?' : 'Your Teaching Style'}</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STYLES.map(style => {
                  const labels: Record<string, string> = { visual: '👁️ Visual', practice: '✍️ Practice', discussion: '💬 Discussion', structured: '📋 Structured' }
                  const currentStyle = profile.role === 'student' ? studentProfile?.learning_style : tutorProfile?.teaching_style
                  return (<button key={style} type="button" onClick={() => { if (profile.role === 'student' && studentProfile) setStudentProfile({ ...studentProfile, learning_style: style }); if (profile.role === 'tutor' && tutorProfile) setTutorProfile({ ...tutorProfile, teaching_style: style }) }} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: currentStyle === style ? '#7C3AED' : 'white', color: currentStyle === style ? 'white' : '#1A1A2E', border: currentStyle === style ? 'none' : '2px solid #E2E8F0', cursor: 'pointer' }}>{labels[style]}</button>)
                })}
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} style={{ padding: '14px', borderRadius: '10px', border: 'none', background: '#7C3AED', color: 'white', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontSize: '16px', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
