'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Conversation = {
  id: string
  student_id: string
  tutor_id: string
  last_message: string | null
  last_message_at: string
  other_name: string
  other_role: string
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export default function ChatPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!activeConvo) return
    const channel = supabase
      .channel('messages-' + activeConvo.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + activeConvo.id }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeConvo])

  async function loadConversations() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)

    const { data: convos } = await supabase
      .from('conversations')
      .select('*')
      .or('student_id.eq.' + session.user.id + ',tutor_id.eq.' + session.user.id)
      .order('last_message_at', { ascending: false })

    if (convos) {
      const withNames: Conversation[] = []
      for (const c of convos) {
        const otherId = c.student_id === session.user.id ? c.tutor_id : c.student_id
        const { data: otherProfile } = await supabase.from('profiles').select('full_name, role').eq('id', otherId).single()
        withNames.push({
          ...c,
          other_name: otherProfile?.full_name || 'Unknown',
          other_role: otherProfile?.role || 'user'
        })
      }
      setConversations(withNames)
    }
    setLoading(false)
  }

  async function openConversation(convo: Conversation) {
    setActiveConvo(convo)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)

    if (userId) {
      await supabase.from('messages').update({ read: true }).eq('conversation_id', convo.id).neq('sender_id', userId)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvo || !userId) return

    const content = newMessage.trim()
    setNewMessage('')

    await supabase.from('messages').insert({
      conversation_id: activeConvo.id,
      sender_id: userId,
      content: content
    })

    await supabase.from('conversations').update({
      last_message: content,
      last_message_at: new Date().toISOString()
    }).eq('id', activeConvo.id)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF5', color: '#1A1A2E', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontWeight: 700, color: '#7C3AED' }}>Loading chats...</p>
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
          <Link href="/dashboard" style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/search" style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Search</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>💬 Messages</h1>

        <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 160px)' }}>
          {/* Conversation list */}
          <div style={{ width: '280px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'auto', flexShrink: 0 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🦦</div>
                <p style={{ fontSize: '14px', color: '#64748B' }}>No conversations yet!</p>
                <Link href="/search" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: 600 }}>Find a tutor →</Link>
              </div>
            ) : (
              conversations.map(convo => (
                <div key={convo.id} onClick={() => openConversation(convo)} style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F1F5F9',
                  background: activeConvo?.id === convo.id ? '#F3E8FF' : 'white',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: convo.other_role === 'tutor' ? '#F3E8FF' : '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {convo.other_role === 'tutor' ? '👩‍🏫' : '🎓'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>{convo.other_name}</p>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {convo.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
            {!activeConvo ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                  <p style={{ color: '#64748B', fontWeight: 600 }}>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {activeConvo.other_role === 'tutor' ? '👩‍🏫' : '🎓'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>{activeConvo.other_name}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{activeConvo.other_role === 'tutor' ? 'Tutor' : 'Student'}</p>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p style={{ color: '#64748B', fontSize: '14px' }}>Say hello! 👋</p>
                    </div>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} style={{
                      alignSelf: msg.sender_id === userId ? 'flex-end' : 'flex-start',
                      maxWidth: '70%'
                    }}>
                      <div style={{
                        padding: '10px 16px',
                        borderRadius: msg.sender_id === userId ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.sender_id === userId ? '#7C3AED' : '#F1F5F9',
                        color: msg.sender_id === userId ? 'white' : '#1A1A2E',
                        fontSize: '14px',
                        lineHeight: 1.5
                      }}>
                        {msg.content}
                      </div>
                      <p style={{
                        fontSize: '11px',
                        color: '#94A3B8',
                        marginTop: '4px',
                        textAlign: msg.sender_id === userId ? 'right' : 'left'
                      }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', color: '#1A1A2E' }}
                  />
                  <button type="submit" style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#7C3AED', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
