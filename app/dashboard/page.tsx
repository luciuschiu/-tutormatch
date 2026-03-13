'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Profile = {
  id: string
  full_name: string
  role: string
  bio: string | null
  avatar_url: string | null
}

type StudentProfile = {
  level: string | null
  subjects: string[]
  location_area: string | null
  budget_min: number | null
  budget_max: number | null
  learning_style: string | null
}

type TutorProfile = {
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
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

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

    await supabase.from('profiles').update({
      full_name: profile.full_name,
      bio: profile.bio,
      updated_at: new Date().toISOString()
    }).eq('id', profile.id)

    if (profile.role === 'student' && studentProfile) {
      await supabase.from('student_profiles').update({
        level: studentProfile.level,
        subjects: studentProfile.subjects,
        location_area: studentProfile.location_area,
        budget_min: studentProfile.budget_min,
        budget_max: studentProfile.budget_max,
        learning_style: studentProfile.learning_style,
      }).eq('id', profile.id)
    }

    if (profile.role === 'tutor' && tutorProfile) {
      await supabase.from('tutor_profiles').update({
        subjects: tutorProfile.subjects,
        levels: tutorProfile.levels,
        hourly_rate: tutorProfile.hourly_rate,
        location_area: tutorProfile.location_area,
        teaching_style: tutorProfile.teaching_style,
        experience_years: tutorProfile.experience_years,
        qualifications: tutorProfile.qualifications,
      }).eq('id', profile.id)
    }

    setMessage('Profile saved! 🦦')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function toggleSubject(subject: string) {
    if (profile?.role === 'student' && studentProfile) {
      const current = studentProfile.subjects || []
      const updated = current.includes(subject) ? current.filter(s => s !== subject) : [...current, subject]
      setStudentProfile({ ...studentProfile, subjects: updated })
    }
    if (profile?.role === 'tutor' && tutorProfile) {
      const current = tutorProfile.subjects || []
      const updated = current.includes(subject) ? current.filter(s => s !== subject) : [...current, subject]
      setTutorProfile({ ...tutorProfile, subjects: updated })
    }
  }

  function toggleLevel(level: string) {
    if (tutorProfile) {
      const current = tutorProfile.levels || []
      const updated = current.includes(level) ? current.filter(l => l !== level) : [...current, level]
      setTutorProfile({ ...tutorProfile, levels: updated })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="text-center">
          <div className="animate-float text-6xl mb-4">🦦</div>
          <p style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 700, color: 'var(--violet)' }}>Loading your profile...</p>
        </div>
      </main>
    )
  }

  if (!profile) return null

  const selectedSubjects = profile.role === 'student' ? (studentProfile?.subjects || []) : (tutorProfile?.subjects || [])

  return (
    <main className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🦦</span>
          <span style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '18px' }} className="gradient-text">TutorMatch</span>
        </Link>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: '14px', color: 'var(--slate)' }}>
            {profile.role === 'student' ? '🎓' : '👩‍🏫'} {profile.full_name}
          </span>
          <button onClick={handleLogout} style={{ fontSize: '13px', color: 'var(--coral)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="text-center mb-8 pt-4">
          <div className="text-5xl mb-3">{profile.role === 'student' ? '🎓' : '👩‍🏫'}</div>
          <h1 style={{ fontFamily: 'Bricolage Grotesque', fontSize: '28px', fontWeight: 800 }}>
            Welcome, {profile.full_name.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate)', marginTop: '4px' }}>
            {profile.role === 'student' ? 'Set up your profile to find your perfect tutor match' : 'Complete your profile to start receiving student matches'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          {[
            { id: 'profile', label: '📝 Profile', show: true },
            { id: 'find', label: profile.role === 'student' ? '🔍 Find Tutors' : '📊 My Students', show: true },
          ].filter(t => t.show).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="px-5 py-2.5 rounded-xl transition-all duration-300" style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: '14px', background: activeTab === tab.id ? 'linear-gradient(135deg, var(--violet), var(--violet-dark))' : 'white', color: activeTab === tab.id ? 'white' : 'var(--slate)', border: activeTab === tab.id ? 'none' : '2px solid #E2E8F0', boxShadow: activeTab === tab.id ? '0 4px 16px rgba(124,58,237,0.3)' : 'none' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="p-3 rounded-xl mb-4 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 600 }}>{message}</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="glass-card p-6" style={{ borderRadius: '20px' }}>
            <h2 style={{ fontFamily: 'Bricolage Grotesque', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
              {profile.role === 'student' ? '🎓 Student Profile' : '👩‍🏫 Tutor Profile'}
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input className="input-field" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>About Me</label>
                <textarea className="input-field" rows={3} placeholder={profile.role === 'student' ? 'What are you looking for in a tutor?' : 'Tell students about your teaching approach...'} value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ resize: 'none' }} />
              </div>

              {profile.role === 'student' && studentProfile && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Level</label>
                  <div className="flex gap-2 flex-wrap">
                    {LEVELS.map(level => (
                      <button key={level} type="button" onClick={() => setStudentProfile({ ...studentProfile, level })} className="px-4 py-2 rounded-xl transition-all" style={{ fontSize: '13px', fontWeight: 600, background: studentProfile.level === level ? 'var(--violet)' : 'white', color: studentProfile.level === level ? 'white' : 'var(--charcoal)', border: studentProfile.level === level ? 'none' : '2px solid #E2E8F0' }}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {profile.role === 'tutor' && tutorProfile && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Levels You Teach</label>
                  <div className="flex gap-2 flex-wrap">
                    {LEVELS.map(level => (
                      <button key={level} type="button" onClick={() => toggleLevel(level)} className="px-4 py-2 rounded-xl transition-all" style={{ fontSize: '13px', fontWeight: 600, background: (tutorProfile.levels || []).includes(level) ? 'var(--teal)' : 'white', color: (tutorProfile.levels || []).includes(level) ? 'white' : 'var(--charcoal)', border: (tutorProfile.levels || []).includes(level) ? 'none' : '2px solid #E2E8F0' }}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  {profile.role === 'student' ? 'Subjects You Need Help With' : 'Subjects You Teach'}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SUBJECTS.map(subject => (
                    <button key={subject} type="button" onClick={() => toggleSubject(subject)} className="px-3 py-1.5 rounded-lg transition-all" style={{ fontSize: '13px', fontWeight: 600, background: selectedSubjects.includes(subject) ? 'var(--violet)' : 'white', color: selectedSubjects.includes(subject) ? 'white' : 'var(--charcoal)', border: selectedSubjects.includes(subject) ? 'none' : '2px solid #E2E8F0' }}>
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Area</label>
                <select className="input-field" value={(profile.role === 'student' ? studentProfile?.location_area : tutorProfile?.location_area) || ''} onChange={e => {
                  if (profile.role === 'student' && studentProfile) setStudentProfile({ ...studentProfile, location_area: e.target.value })
                  if (profile.role === 'tutor' && tutorProfile) setTutorProfile({ ...tutorProfile, location_area: e.target.value })
                }}>
                  <option value="">Select your area</option>
                  {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>

              {profile.role === 'student' && studentProfile && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Min Budget ($/hr)</label>
                    <input className="input-field" type="number" placeholder="25" value={studentProfile.budget_min || ''} onChange={e => setStudentProfile({ ...studentProfile, budget_min: parseInt(e.target.value) || null })} />
                  </div>
                  <div className="flex-1">
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Max Budget ($/hr)</label>
                    <input className="input-field" type="number" placeholder="60" value={studentProfile.budget_max || ''} onChange={e => setStudentProfile({ ...studentProfile, budget_max: parseInt(e.target.value) || null })} />
                  </div>
                </div>
              )}

              {profile.role === 'tutor' && tutorProfile && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Hourly Rate (S$)</label>
                    <input className="input-field" type="number" placeholder="45" value={tutorProfile.hourly_rate || ''} onChange={e => setTutorProfile({ ...tutorProfile, hourly_rate: parseInt(e.target.value) || null })} />
                  </div>
                  <div className="flex-1">
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Years Experience</label>
                    <input className="input-field" type="number" placeholder="2" value={tutorProfile.experience_years || ''} onChange={e => setTutorProfile({ ...tutorProfile, experience_years: parseInt(e.target.value) || null })} />
                  </div>
                </div>
              )}

              {profile.role === 'tutor' && tutorProfile && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Qualifications</label>
                  <textarea className="input-field" rows={2} placeholder="e.g. NUS Computer Science Year 3, A-Level 4H2 90RP" value={tutorProfile.qualifications || ''} onChange={e => setTutorProfile({ ...tutorProfile, qualifications: e.target.value })} style={{ resize: 'none' }} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  {profile.role === 'student' ? 'How Do You Learn Best?' : 'Your Teaching Style'}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STYLES.map(style => {
                    const labels: Record<string, string> = { visual: '👁️ Visual', practice: '✍️ Practice', discussion: '💬 Discussion', structured: '📋 Structured' }
                    const currentStyle = profile.role === 'student' ? studentProfile?.learning_style : tutorProfile?.teaching_style
                    return (
                      <button key={style} type="button" onClick={() => {
                        if (profile.role === 'student' && studentProfile) setStudentProfile({ ...studentProfile, learning_style: style })
                        if (profile.role === 'tutor' && tutorProfile) setTutorProfile({ ...tutorProfile, teaching_style: style })
                      }} className="px-4 py-2 rounded-xl transition-all" style={{ fontSize: '13px', fontWeight: 600, background: currentStyle === style ? 'var(--violet)' : 'white', color: currentStyle === style ? 'white' : 'var(--charcoal)', border: currentStyle === style ? 'none' : '2px solid #E2E8F0' }}>
                        {labels[style]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving} className="btn-primary w-full" style={{ textAlign: 'center', marginTop: '8px', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving...' : '💾 Save Profile'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'find' && (
          <div className="glass-card p-8 text-center" style={{ borderRadius: '20px' }}>
            <div className="text-5xl mb-4 animate-float">🦦</div>
            <h2 style={{ fontFamily: 'Bricolage Grotesque', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
              {profile.role === 'student' ? 'Tutor matching coming next!' : 'Student requests coming next!'}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--slate)' }}>
              Complete your profile first — Ollie needs your preferences to find the best matches! 🎯
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
