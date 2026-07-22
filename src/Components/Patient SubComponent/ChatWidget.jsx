import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { askChatbot } from '../../Services/ChatbotService';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your AI Health Assistant. Ask me anything general about health or how to use this platform." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
        setInput('');
        setLoading(true);

        try {
            const data = await askChatbot(trimmed);
            setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: 'Sorry, the AI assistant is unavailable right now. Please try again shortly.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200 }}>
            {/* ── Chat panel ── */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 76,
                        right: 0,
                        width: 360,
                        height: 480,
                        background: '#fff',
                        borderRadius: 14,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        animation: 'chatPopIn 0.18s ease-out',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <MessageCircle size={17} color="#fff" />
                            </div>
                            <div>
                                <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>
                                    AI Health Assistant
                                </p>
                                <p style={{ color: '#BFDBFE', fontSize: 11, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4, display: 'flex' }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, background: '#F9FAFB' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div
                                    style={{
                                        maxWidth: '78%',
                                        padding: '9px 13px',
                                        borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                                        background: msg.role === 'user' ? '#2563EB' : '#fff',
                                        color: msg.role === 'user' ? '#fff' : '#111827',
                                        border: msg.role === 'user' ? 'none' : '1px solid #E5E7EB',
                                        fontSize: 13.5,
                                        lineHeight: 1.5,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{ padding: '9px 13px', borderRadius: '14px 14px 14px 3px', background: '#fff', border: '1px solid #E5E7EB', fontSize: 13, color: '#9CA3AF' }}>
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: 10, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, background: '#fff' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={loading}
                            style={{
                                flex: 1, border: '1px solid #E5E7EB', borderRadius: 20,
                                padding: '9px 14px', fontSize: 13.5, outline: 'none',
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: (loading || !input.trim()) ? '#93C5FD' : '#2563EB',
                                border: 'none', color: '#fff', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: (loading || !input.trim()) ? 'default' : 'pointer', flexShrink: 0,
                            }}
                        >
                            <Send size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Floating action button ── */}
            <div style={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!isOpen && (
                    <svg
                        width="96"
                        height="96"
                        viewBox="0 0 96 96"
                        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                    >
                        <path
                            id="curve"
                            d="M 8,52 A 40,40 0 1 1 88,52"
                            fill="none"
                        />
                        <text fill="#2563EB" fontSize="10.5" fontWeight="700" letterSpacing="1.5">
                            <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                AI ASSISTANT
                            </textPath>
                        </text>
                    </svg>
                )}

                <button
                    onClick={() => setIsOpen((v) => !v)}
                    style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#2563EB', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                        transition: 'transform 0.15s',
                        zIndex: 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isOpen ? <X size={24} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
                </button>
            </div>

            <style>{`
                @keyframes chatPopIn {
                    from { opacity: 0; transform: translateY(8px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ChatWidget;