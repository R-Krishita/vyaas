// src/components/Chatbot.jsx
// AI-powered chatbot component with Gemini integration

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "👋 Hello! I'm your Ayurvedic crop assistant. Ask me anything about crop cultivation, pest management, or market prices!",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/chatbot/ask', {
                message: inputMessage,
                farmer_id: 'admin_user'
            });

            const botMessage = {
                id: Date.now() + 1,
                text: response.data.reply,
                isBot: true,
                timestamp: new Date(),
                quickReplies: response.data.quick_replies || []
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "⚠️ Sorry, I'm having trouble connecting. Please make sure the backend is running and try again.",
                isBot: true,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
            console.error('Chatbot error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickReply = (reply) => {
        setInputMessage(reply);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating toggle button */}
            <button
                className="chatbot-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle chatbot"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div className="chatbot-container">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-content">
                            <span className="chatbot-icon">🌿</span>
                            <div>
                                <div className="chatbot-title">AI Assistant</div>
                                <div className="chatbot-subtitle">Ayurvedic Crop Expert</div>
                            </div>
                        </div>
                        <button
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chatbot"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((message) => (
                            <div key={message.id} className={`chatbot-message ${message.isBot ? 'bot' : 'user'}`}>
                                {message.isBot && (
                                    <div className="chatbot-avatar">🤖</div>
                                )}
                                <div className={`chatbot-bubble ${message.isError ? 'error' : ''}`}>
                                    <div className="chatbot-text">{message.text}</div>
                                    <div className="chatbot-time">
                                        {message.timestamp.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    {message.quickReplies && message.quickReplies.length > 0 && (
                                        <div className="chatbot-quick-replies">
                                            {message.quickReplies.map((reply, idx) => (
                                                <button
                                                    key={idx}
                                                    className="quick-reply-btn"
                                                    onClick={() => handleQuickReply(reply)}
                                                >
                                                    {reply}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {!message.isBot && (
                                    <div className="chatbot-avatar user-avatar">👤</div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-message bot">
                                <div className="chatbot-avatar">🤖</div>
                                <div className="chatbot-bubble">
                                    <div className="chatbot-typing">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="chatbot-input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            className="chatbot-input"
                            placeholder="Ask me anything..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-send"
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                        >
                            {isLoading ? '⏳' : '➤'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
