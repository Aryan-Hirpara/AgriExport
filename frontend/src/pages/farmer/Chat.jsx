import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Check, CheckCheck, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function Chat() {
  const { user } = useApp();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.messages.getConversations()
      .then(res => {
        if (res?.data) {
          setConversations(res.data);
          if (res.data.length > 0) {
            setActiveConvo(res.data[0]);
          }
        }
      })
      .catch(err => console.error('Failed to load conversations:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeConvo?.conversation_id) {
      api.messages.getMessages(activeConvo.conversation_id)
        .then(res => {
          if (res?.data) {
            setMessages(res.data);
          }
        })
        .catch(err => console.error('Failed to load messages:', err));
    }
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConvo) return;
    const text = input.trim();
    setInput('');

    try {
      const res = await api.messages.sendMessage({
        receiverId: activeConvo.other_user_id,
        conversationId: activeConvo.conversation_id,
        content: text,
      });

      if (res?.data) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading chats...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <MessageSquare size={36} color="var(--green-primary)" />
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No Messages Yet</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: 440, marginBottom: 24, fontSize: '0.95rem' }}>
          When you receive trade offers on your produce or submit counter-proposals to buyers, real-time negotiation chats will appear here.
        </p>
        <Link to="/farmer/find-buyers" className="btn btn-primary">
          Explore Buyer Requirements
        </Link>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '320px 1fr' }}>
      {/* Conversations List Sidebar */}
      <div style={{ borderRight: '1px solid var(--border)', background: '#fff', overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Messages</h3>
        </div>
        {conversations.map(c => (
          <div
            key={c.conversation_id}
            onClick={() => setActiveConvo(c)}
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: activeConvo?.conversation_id === c.conversation_id ? 'var(--green-light)' : '#fff',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '1.75rem', width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.other_user_avatar || (c.other_user_role === 'enterprise' ? '🏢' : '🧑‍🌾')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.other_user_name}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.last_message || 'Chat started'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-page)' }}>
        {/* Header */}
        <div style={{ background: 'var(--green-primary)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            {activeConvo?.other_user_avatar || (activeConvo?.other_user_role === 'enterprise' ? '🏢' : '🧑‍🌾')}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.05rem' }}>
              {activeConvo?.other_user_name || 'Chat'}
            </h4>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
              {activeConvo?.other_user_role || 'Trade Partner'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => {
            const isMe = String(msg.sender_id) === String(user?.id);
            return (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
              >
                <div style={{ maxWidth: '70%' }}>
                  <div className={`bubble ${isMe ? 'bubble-sent' : 'bubble-received'}`}>
                    {msg.content}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {isMe && (
                      msg.is_read ? <CheckCheck size={12} color="var(--green-primary)" /> : <Check size={12} color="var(--text-muted)" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <motion.button
            className="btn btn-primary"
            style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, minHeight: 'auto', flexShrink: 0 }}
            onClick={handleSend}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim()}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
