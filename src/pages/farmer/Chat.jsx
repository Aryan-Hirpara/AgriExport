import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Check, CheckCheck } from 'lucide-react';

const MESSAGES = [
  { id: 1, text: 'Namaste Ramesh ji. We are interested in your Unjha jeera. 5 ton at ₹308/kg.', sent: false, time: '10:32 AM', read: true },
  { id: 2, text: 'Namaste Ahmed bhai. Our price is ₹315/kg. It is premium quality, FSSAI certified.', sent: true, time: '10:35 AM', read: true },
  { id: 3, text: 'We understand. Can we do ₹312? We also need delivery by 15 Oct.', sent: false, time: '10:37 AM', read: true },
  { id: 4, text: '₹312 is acceptable. Pickup from Unjha farm. Please bring your own bags.', sent: true, time: '10:42 AM', read: true },
  { id: 5, text: 'Deal! We will send our transport on 12 Oct. Please keep 5 tons ready.', sent: false, time: '10:44 AM', read: false },
];

export default function Chat() {
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: messages.length + 1, text: input, sent: true, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), read: false };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: prev.length + 1, text: 'Understood. We will confirm.', sent: false, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), read: false }]);
    }, 2000);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: 72 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>🌶️</div>
        <div>
          <h4 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>Ahmed Spice Exports</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%' }} />
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem' }}>Online</span>
          </div>
        </div>
      </div>

      {/* Pinned Offer Summary */}
      <div style={{ background: 'var(--green-light)', padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.25rem' }}>📌</span>
        <div style={{ flex: 1, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Jeera • <span className="notranslate">5 ton</span></span>
          <span className="notranslate" style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--green-primary)' }}>₹312/kg</span>
          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✅ Deal Agreed</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-page)' }}>
        {/* Date divider */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--border)', padding: '4px 12px', borderRadius: 99 }}>Today, 01 Oct 2026</span>
        </div>

        {messages.map((msg, i) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} style={{ display: 'flex', justifyContent: msg.sent ? 'flex-end' : 'flex-start' }}>
            <div>
              {!msg.sent && (
                <div style={{ width: 28, height: 28, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: 4 }}>🌶️</div>
              )}
              <div className={`bubble ${msg.sent ? 'bubble-sent' : 'bubble-received'}`}>
                {msg.text}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: msg.sent ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                {msg.sent && (
                  msg.read ? <CheckCheck size={12} color="var(--green-primary)" /> : <Check size={12} color="var(--text-muted)" />
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌶️</div>
            <div className="bubble bubble-received" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 16px' }}>
              {[0, 1, 2].map(d => (
                <motion.div key={d} animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <button style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--bg-page)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Paperclip size={18} color="var(--text-muted)" />
        </button>
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
          style={{ width: 48, height: 48, borderRadius: '50%', padding: 0, minHeight: 'auto', flexShrink: 0 }}
          onClick={handleSend}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}
