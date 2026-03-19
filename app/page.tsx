'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const features = [
    { emoji: '🧠', title: 'Smart Matching', desc: 'Algorithm scores compatibility on subject, location, budget, and teaching style.', color: '#E67E22' },
    { emoji: '💬', title: 'In-App Chat', desc: 'Message your tutor instantly. No more WhatsApp hunting.', color: '#2BA5A5' },
    { emoji: '📅', title: 'Easy Booking', desc: 'See real-time availability. Book or cancel with one tap.', color: '#8B6914' },
    { emoji: '⭐', title: 'Verified Reviews', desc: 'Double-blind ratings after every lesson. Real trust.', color: '#27AE60' },
  ]
  const subjects = ['A-Math', 'E-Math', 'H2 Math', 'Physics', 'Chemistry', 'Biology', 'English', 'GP', 'Economics', 'History', 'Chinese', 'Malay', 'Tamil', 'Computing', 'Literature']

  return (
    <main style={{ minHeight: '100vh', position: 'relative', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif', overflowX: 'hidden' }}>
      <div className="blob-amber" style={{ top: '-100px', right: '-100px' }} />
      <div className="blob-teal" style={{ top: '400px', left: '-150px' }} />

      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '28px' }} className="animate-wiggle">🦫</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '20px' }} className="gradient-text">TutorMatch</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/auth" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px', border: '2px solid #F5B041', background: 'white', color: '#E67E22', fontWeight: 800, fontFamily: 'Nunito', textDecoration: 'none' }}>Log in</Link>
          <Link href="/auth" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, fontFamily: 'Nunito', textDecoration: 'none', boxShadow: '0 2px 8px rgba(230,126,34,0.3)' }}>Sign up</Link>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '520px', flex: '1 1 320px' }}>
            <div className="animate-fade-in-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', marginBottom: '20px', background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.15)' }}>
              <span>🇸🇬</span>
              <span style={{ color: '#E67E22', fontWeight: 700, fontSize: '13px', fontFamily: 'Nunito' }}>Made for Singapore students</span>
            </div>
            <h1 className="animate-fade-in-up delay-100" style={{ fontFamily: 'Nunito', fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 900, lineHeight: 1.08, marginBottom: '16px' }}>Find your<br /><span className="gradient-text">perfect tutor</span><br />in minutes</h1>
            <p className="animate-fade-in-up delay-200" style={{ fontSize: 'clamp(15px, 4vw, 18px)', lineHeight: 1.7, color: '#6B5B4E', marginBottom: '24px', padding: '0 8px' }}>Stop paying 50% agency commissions. TutorMatch connects O-Level and A-Level students with compatible tutors — based on subject, location, budget, and style.</p>
            <div className="animate-fade-in-up delay-300" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              <Link href="/auth" className="btn-primary" style={{ textAlign: 'center', minWidth: '200px' }}>I need a tutor →</Link>
              <Link href="/auth" className="btn-secondary" style={{ textAlign: 'center', minWidth: '200px' }}>I want to teach</Link>
            </div>
          </div>

          <div className="animate-bounce-in delay-300" style={{ position: 'relative', flex: '0 1 320px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,126,34,0.12) 0%, transparent 70%)', transform: 'scale(1.5)' }} />
            <div style={{ position: 'relative', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(230,126,34,0.12)', padding: '24px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(139,105,20,0.06)' }}>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <div className="animate-float" style={{ fontSize: '64px', marginBottom: '4px' }}>🦫</div>
                <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '15px', color: '#E67E22' }}>Capy says hi! 👋</p>
                <p style={{ fontSize: '12px', color: '#6B5B4E' }}>Your matching assistant</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(230,126,34,0.06), rgba(43,165,165,0.06))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(230,126,34,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👩‍🏫</div>
                    <div><p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>Ms. Sarah T.</p><p style={{ fontSize: '11px', color: '#6B5B4E', margin: 0 }}>H2 Math • Bishan</p></div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '16px', background: 'linear-gradient(135deg, #27AE60, #1E8449)', color: 'white', fontSize: '12px', fontWeight: 900, fontFamily: 'Nunito' }}>96%</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['⭐ 4.9', '📍 1.2km', '💰 $55/hr'].map((t, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: '6px', background: 'white', fontSize: '11px', fontWeight: 600 }}>{t}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                <span>🔥</span><span style={{ fontSize: '12px', fontWeight: 700, color: '#E67E22' }}>3-lesson streak!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, padding: '12px 0', overflow: 'hidden', background: 'rgba(230,126,34,0.03)' }}>
        <div className="animate-scroll" style={{ display: 'flex', gap: '10px', whiteSpace: 'nowrap' }}>
          {[...subjects, ...subjects].map((s, i) => <span key={i} style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 600, flexShrink: 0, background: i % 3 === 0 ? 'rgba(230,126,34,0.08)' : i % 3 === 1 ? 'rgba(43,165,165,0.08)' : 'rgba(139,105,20,0.08)', color: i % 3 === 0 ? '#E67E22' : i % 3 === 1 ? '#2BA5A5' : '#8B6914' }}>{s}</span>)}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Nunito', fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 900, marginBottom: '8px' }}>Three taps to your <span className="gradient-text">best match</span></h2>
          <p style={{ color: '#6B5B4E', maxWidth: '400px', margin: '0 auto' }}>No agencies. No middlemen. Just smart connections.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            { step: '01', emoji: '✍️', title: 'Tell us what you need', desc: 'Pick your subject, level, budget, and area.', gradient: 'linear-gradient(135deg, #E67E22, #CA6F1E)' },
            { step: '02', emoji: '🦫', title: 'Capy finds matches', desc: 'Algorithm scores tutors on 8 factors.', gradient: 'linear-gradient(135deg, #2BA5A5, #1E8C8C)' },
            { step: '03', emoji: '🎯', title: 'Book and learn', desc: 'Chat, pick a time, book your lesson.', gradient: 'linear-gradient(135deg, #8B6914, #5D4E37)' },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', borderBottomLeftRadius: '100%', opacity: 0.15, background: item.gradient }} />
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 900, marginBottom: '12px', background: item.gradient, fontFamily: 'Nunito' }}>{item.step}</div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.emoji}</div>
              <h3 style={{ fontFamily: 'Nunito', fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: '#6B5B4E', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Nunito', fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 900 }}>Why students <span style={{ color: '#E67E22' }}>♥</span> TutorMatch</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px', cursor: 'pointer', borderColor: hoveredFeature === i ? f.color : 'rgba(230,126,34,0.12)', borderWidth: '2px' }} onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0, background: f.color + '18' }}>{f.emoji}</div>
                <div><h3 style={{ fontFamily: 'Nunito', fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{f.title}</h3><p style={{ fontSize: '13px', color: '#6B5B4E', lineHeight: 1.5 }}>{f.desc}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: '700px', margin: '0 auto', padding: '32px 20px' }}>
        <div className="glass-card" style={{ padding: '28px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(230,126,34,0.04), rgba(43,165,165,0.04))' }}>
          <h2 style={{ fontFamily: 'Nunito', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 900, marginBottom: '20px' }}>Tutors keep <span style={{ color: '#27AE60' }}>85%</span> of their earnings</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ flex: '1 1 180px', padding: '16px', borderRadius: '16px', background: 'rgba(231,76,60,0.06)' }}>
              <p style={{ fontSize: '13px', color: '#6B5B4E', marginBottom: '2px' }}>Traditional agencies</p>
              <p style={{ fontFamily: 'Nunito', fontSize: 'clamp(24px, 5vw, 30px)', fontWeight: 900, color: '#E74C3C' }}>50% cut</p>
            </div>
            <div style={{ fontSize: '24px' }}>→</div>
            <div style={{ flex: '1 1 180px', padding: '16px', borderRadius: '16px', background: 'rgba(39,174,96,0.06)' }}>
              <p style={{ fontSize: '13px', color: '#6B5B4E', marginBottom: '2px' }}>TutorMatch</p>
              <p style={{ fontFamily: 'Nunito', fontSize: 'clamp(24px, 5vw, 30px)', fontWeight: 900, color: '#27AE60' }}>15% only</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: '700px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
        <div className="animate-float" style={{ fontSize: '56px', marginBottom: '12px' }}>🦫</div>
        <h2 style={{ fontFamily: 'Nunito', fontSize: 'clamp(24px, 6vw, 42px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '12px' }}>Ready to find your<br /><span className="gradient-text">perfect match?</span></h2>
        <p style={{ fontSize: '16px', color: '#6B5B4E', maxWidth: '360px', margin: '0 auto 24px' }}>Join Singapore&apos;s chillest tutor marketplace. Free for students.</p>
        <Link href="/auth" style={{ display: 'inline-block', padding: '14px 36px', fontSize: '17px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, fontFamily: 'Nunito', textDecoration: 'none', boxShadow: '0 4px 16px rgba(230,126,34,0.3)' }}>Get started free →</Link>
      </section>

      <footer style={{ position: 'relative', zIndex: 10, padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(230,126,34,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '18px' }}>🦫</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '14px' }} className="gradient-text">TutorMatch SG</span>
        </div>
        <p style={{ fontSize: '12px', color: '#6B5B4E' }}>© 2026 TutorMatch. Made with 🦫 in Singapore.</p>
      </footer>
    </main>
  )
}
