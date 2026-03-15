'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    { emoji: '🧠', title: 'Smart Matching', desc: 'Our algorithm scores compatibility based on subject, location, budget, teaching style, and availability.', color: '#E67E22' },
    { emoji: '💬', title: 'In-App Chat', desc: 'Message your tutor instantly. No more WhatsApp hunting or agency middlemen.', color: '#2BA5A5' },
    { emoji: '📅', title: 'Easy Booking', desc: 'See real-time availability. Book, reschedule, or cancel with one tap.', color: '#8B6914' },
    { emoji: '⭐', title: 'Verified Reviews', desc: 'Double-blind ratings after every lesson. No fake reviews, real trust.', color: '#27AE60' },
  ]

  const subjects = ['A-Math', 'E-Math', 'H2 Math', 'Physics', 'Chemistry', 'Biology', 'English', 'GP', 'Economics', 'History', 'Chinese', 'Malay', 'Tamil', 'Computing', 'Literature']

  return (
    <main className="min-h-screen relative" style={{ background: 'var(--cream)' }}>
      <div className="blob-amber" style={{ top: '-100px', right: '-100px' }} />
      <div className="blob-teal" style={{ top: '400px', left: '-150px' }} />
      <div className="blob-brown" style={{ bottom: '200px', right: '-100px' }} />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-wiggle">🦫</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '24px' }} className="gradient-text">TutorMatch</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="btn-secondary" style={{ padding: '10px 24px', fontSize: '14px' }}>Log in</Link>
          <Link href="/auth" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>Sign up free</Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.15)' }}>
              <span className="text-sm">🇸🇬</span>
              <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '14px', fontFamily: 'Nunito' }}>Made for Singapore students</span>
            </div>

            <h1 className="animate-fade-in-up delay-100" style={{ fontFamily: 'Nunito', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 900, lineHeight: 1.08, color: 'var(--charcoal)', marginBottom: '20px' }}>
              Find your<br /><span className="gradient-text">perfect tutor</span><br />in minutes
            </h1>

            <p className="animate-fade-in-up delay-200" style={{ fontSize: '18px', lineHeight: 1.7, color: 'var(--slate)', maxWidth: '480px', marginBottom: '32px' }}>
              Stop paying 50% agency commissions. TutorMatch uses smart matching to connect O-Level and A-Level students with compatible tutors — based on subject, location, budget, and teaching style.
            </p>

            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/auth" className="btn-primary" style={{ textAlign: 'center', fontSize: '17px' }}>I need a tutor →</Link>
              <Link href="/auth" className="btn-secondary" style={{ textAlign: 'center', fontSize: '17px' }}>I want to teach</Link>
            </div>

            <div className="animate-fade-in-up delay-400 flex items-center gap-4 mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['🧑‍🎓', '👩‍🏫', '🧑‍💼', '👨‍🎓'].map((emoji, i) => (
                  <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: i % 2 === 0 ? 'rgba(230,126,34,0.1)' : 'rgba(43,165,165,0.1)', border: '2px solid var(--cream)' }}>{emoji}</div>
                ))}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--slate)' }}>Join <strong style={{ color: 'var(--amber)' }}>Singapore&apos;s</strong> chillest tutor marketplace</span>
            </div>
          </div>

          <div className="flex-1 relative flex justify-center">
            <div className="animate-bounce-in delay-300 relative">
              <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(230,126,34,0.12) 0%, transparent 70%)', transform: 'scale(1.5)' }} />
              <div className="relative glass-card p-8" style={{ width: '340px', borderRadius: '28px' }}>
                <div className="text-center mb-4">
                  <div className="animate-float text-8xl mb-2">🦫</div>
                  <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '16px', color: 'var(--amber)' }}>Capy says hi! 👋</p>
                  <p style={{ fontSize: '13px', color: 'var(--slate)', marginTop: '2px' }}>Your matching assistant</p>
                </div>
                <div className="p-4 rounded-2xl mt-4" style={{ background: 'linear-gradient(135deg, rgba(230,126,34,0.06), rgba(43,165,165,0.06))' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(230,126,34,0.1)' }}>👩‍🏫</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '14px' }}>Ms. Sarah T.</p>
                        <p style={{ fontSize: '12px', color: 'var(--slate)' }}>H2 Math • Bishan</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, var(--success), #1E8449)', color: 'white', fontSize: '13px', fontWeight: 800, fontFamily: 'Nunito' }}>96%</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['⭐ 4.9', '📍 1.2km', '💰 $55/hr'].map((tag, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg" style={{ background: 'white', fontSize: '12px', fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span>🔥</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)' }}>3-lesson streak! Keep it going!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-6 overflow-hidden" style={{ background: 'rgba(230,126,34,0.03)' }}>
        <div className="flex gap-3 animate-scroll whitespace-nowrap">
          {[...subjects, ...subjects].map((subject, i) => (
            <span key={i} className="inline-flex items-center px-4 py-2 rounded-full shrink-0" style={{ background: i % 3 === 0 ? 'rgba(230,126,34,0.08)' : i % 3 === 1 ? 'rgba(43,165,165,0.08)' : 'rgba(139,105,20,0.08)', fontSize: '14px', fontWeight: 600, color: i % 3 === 0 ? 'var(--amber)' : i % 3 === 1 ? 'var(--teal)' : 'var(--brown)' }}>{subject}</span>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: 'Nunito', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>Three taps to your <span className="gradient-text">best match</span></h2>
          <p style={{ fontSize: '16px', color: 'var(--slate)', maxWidth: '500px', margin: '0 auto' }}>No agencies. No middlemen. Just smart, direct connections.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', emoji: '✍️', title: 'Tell us what you need', desc: 'Pick your subject, level, budget, and preferred area. Takes 30 seconds.', gradient: 'linear-gradient(135deg, var(--amber), var(--amber-dark))' },
            { step: '02', emoji: '🦫', title: 'Capy finds your matches', desc: 'Our algorithm scores every tutor on 8 compatibility factors and ranks your best fits.', gradient: 'linear-gradient(135deg, var(--teal), #1E8C8C)' },
            { step: '03', emoji: '🎯', title: 'Book and start learning', desc: 'Chat with your tutor, pick a time, and book your first lesson. Pay securely in-app.', gradient: 'linear-gradient(135deg, var(--brown), var(--brown-dark))' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-15" style={{ background: item.gradient }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold mb-4" style={{ background: item.gradient, fontFamily: 'Nunito' }}>{item.step}</div>
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 style={{ fontFamily: 'Nunito', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '15px', color: 'var(--slate)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: 'Nunito', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900 }}>Why students <span style={{ color: 'var(--amber)' }}>♥</span> TutorMatch</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-6 cursor-pointer" onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)} style={{ borderColor: hoveredFeature === i ? feature.color : 'rgba(230,126,34,0.12)', borderWidth: '2px' }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${feature.color}18`, transition: 'transform 0.3s', transform: hoveredFeature === i ? 'scale(1.1) rotate(-5deg)' : 'scale(1)' }}>{feature.emoji}</div>
                <div>
                  <h3 style={{ fontFamily: 'Nunito', fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="glass-card p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(230,126,34,0.04), rgba(43,165,165,0.04))' }}>
          <h2 style={{ fontFamily: 'Nunito', fontSize: '28px', fontWeight: 900, marginBottom: '24px' }}>Tutors keep <span style={{ color: 'var(--success)' }}>85%</span> of their earnings</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex-1 p-5 rounded-2xl max-w-xs" style={{ background: 'rgba(231,76,60,0.06)' }}>
              <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '4px' }}>Traditional agencies</p>
              <p style={{ fontFamily: 'Nunito', fontSize: '32px', fontWeight: 900, color: '#E74C3C' }}>50% cut</p>
              <p style={{ fontSize: '13px', color: 'var(--slate)' }}>of first month&apos;s fees</p>
            </div>
            <div className="text-3xl">→</div>
            <div className="flex-1 p-5 rounded-2xl max-w-xs" style={{ background: 'rgba(39,174,96,0.06)' }}>
              <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '4px' }}>TutorMatch</p>
              <p style={{ fontFamily: 'Nunito', fontSize: '32px', fontWeight: 900, color: 'var(--success)' }}>15% only</p>
              <p style={{ fontSize: '13px', color: 'var(--slate)' }}>per lesson, ongoing</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-4 animate-float">🦫</div>
        <h2 style={{ fontFamily: 'Nunito', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px' }}>
          Ready to find your<br /><span className="gradient-text">perfect match?</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'var(--slate)', maxWidth: '420px', margin: '0 auto 32px' }}>Join Singapore&apos;s chillest tutor marketplace. Free for students. Always.</p>
        <Link href="/auth" className="btn-primary" style={{ fontSize: '18px', padding: '16px 40px' }}>Get started free →</Link>
      </section>

      <footer className="relative z-10 py-8 text-center" style={{ borderTop: '1px solid rgba(230,126,34,0.1)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🦫</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '16px' }} className="gradient-text">TutorMatch SG</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--slate)' }}>© 2026 TutorMatch. Made with 🦫 in Singapore.</p>
      </footer>
    </main>
  )
}
