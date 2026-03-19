'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Conversation = { id: string; student_id: string; tutor_id: string; last_message: string | null; last_message_at: string; other_name: string; other_role: string }
type Message = { id: string; conversation_id: string; sender_id: string; content: string; read: boolean; created_at: string }

export default function ChatPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadConversations() }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    if (!activeConvo) return
    const channel = supabase.channel('messages-' + activeConvo.id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + activeConvo.id }, (payload) => { setMessages(prev => [...prev, payload.new as Message]) }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeConvo])

  async function loadConversations() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)
    const { data: convos } = await supabase.from('conversations').select('*').or('student_id.eq.' + session.user.id + ',tutor_id.eq.' + session.user.id).order('last_message_at', { ascending: false })
    if (convos) {
      const withNames: Conversation[] = []
      for (const c of convos) { const otherId = c.student_id === session.user.id ? c.tutor_id : c.student_id; const { data: op } = await supabase.from('profiles').select('full_name, role').eq('id', otherId).single(); withNames.push({ ...c, other_name: op?.full_name || 'Unknown', other_role: op?.role || 'user' }) }
      setConversations(withNames)
    }
    setLoading(false)
  }

  async function openConversation(convo: Conversation) {
    setActiveConvo(convo)
    setShowList(false)
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', convo.id).order('created_at', { ascending: true })
    if (data) setMessages(data)
    if (userId) await supabase.from('messages').update({ read: true }).eq('conversation_id', convo.id).neq('sender_id', userId)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvo || !userId) return
    const content = newMessage.trim(); setNewMessage('')
    await supabase.from('messages').insert({ conversation_id: activeConvo.id, sender_id: userId, content })
    await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', activeConvo.id)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '16px' }}>💬</div><p style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'Nunito' }}>Loading chats...</p></div></div>

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F0', color: '#2C1810', fontFamily: 'Quicksand, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#2C1810' }}><span style={{ fontSize: '24px' }}>🦫</span><span style={{ fontWeight: 900, fontSize: '18px', color: '#E67E22', fontFamily: 'Nunito' }}>TutorMatch</span></Link>
        <div style={{ display: 'flex', gap: '12px' }}><Link href="/dashboard" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>Dashboard</Link><Link href="/search" style={{ fontSize: '14px', color: '#E67E22', fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito' }}>Search</Link></div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px', fontFamily: 'Nunito' }}>💬 Messages</h1>

        {/* Desktop: side by side / Mobile: toggle between list and chat */}
        <div style={{ display: 'flex', gap: '12px', height: 'calc(100vh - 140px)' }}>

          {/* Conversation list */}
          <div style={{
            width: activeConvo && !showList ? '0' : '100%',
            maxWidth: '300px',
            minWidth: activeConvo && !showList ? '0' : '240px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E8DFD4',
            overflow: activeConvo && !showList ? 'hidden' : 'auto',
            flexShrink: 0,
            transition: 'all 0.3s',
            display: activeConvo && !showList ? 'none' : 'block'
          }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}><div style={{ fontSize: '40px', marginBottom: '8px' }}>🦫</div><p style={{ fontSize: '14px', color: '#6B5B4E' }}>No conversations yet!</p><Link href="/search" style={{ fontSize: '13px', color: '#E67E22', fontWeight: 700, fontFamily: 'Nunito' }}>Find a tutor →</Link></div>
            ) : conversations.map(convo => (
              <div key={convo.id} onClick={() => openConversation(convo)} style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #F5EDE3', background: activeConvo?.id === convo.id ? '#FFF0DB' : 'white', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: convo.other_role === 'tutor' ? '#FFF0DB' : '#E8F6F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{convo.other_role === 'tutor' ? '👩‍🏫' : '🎓'}</div>
                  <div style={{ overflow: 'hidden' }}><p style={{ fontWeight: 800, fontSize: '14px', margin: 0, fontFamily: 'Nunito' }}>{convo.other_name}</p><p style={{ fontSize: '12px', color: '#6B5B4E', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{convo.last_message || 'No messages yet'}</p></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat area */}
          <div style={{
            flex: 1,
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E8DFD4',
            display: !activeConvo && !showList ? 'none' : 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}>
            {!activeConvo ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div><p style={{ color: '#6B5B4E', fontWeight: 700, fontFamily: 'Nunito' }}>Select a conversation</p></div></div>
            ) : (
              <>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5EDE3', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => setShowList(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px', display: 'inline-block' }}>←</button>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFF0DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{activeConvo.other_role === 'tutor' ? '👩‍🏫' : '🎓'}</div>
                  <div><p style={{ fontWeight: 800, fontSize: '14px', margin: 0, fontFamily: 'Nunito' }}>{activeConvo.other_name}</p><p style={{ fontSize: '11px', color: '#6B5B4E', margin: 0 }}>{activeConvo.other_role === 'tutor' ? 'Tutor' : 'Student'}</p></div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {messages.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0' }}><p style={{ color: '#6B5B4E', fontSize: '14px' }}>Say hello! 👋</p></div>}
                  {messages.map(msg => (
                    <div key={msg.id} style={{ alignSelf: msg.sender_id === userId ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <div style={{ padding: '10px 14px', borderRadius: msg.sender_id === userId ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.sender_id === userId ? 'linear-gradient(135deg, #E67E22, #CA6F1E)' : '#F5EDE3', color: msg.sender_id === userId ? 'white' : '#2C1810', fontSize: '14px', lineHeight: 1.5 }}>{msg.content}</div>
                      <p style={{ fontSize: '10px', color: '#A0937E', marginTop: '3px', textAlign: msg.sender_id === userId ? 'right' : 'left' }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} style={{ padding: '10px 12px', borderTop: '1px solid #F5EDE3', display: 'flex', gap: '8px' }}>
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '2px solid #E8DFD4', fontSize: '14px', outline: 'none', background: 'white', color: '#2C1810', fontFamily: 'Quicksand' }} />
                  <button type="submit" style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #E67E22, #CA6F1E)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'Nunito' }}>Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          div[style*="display: none"] { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
