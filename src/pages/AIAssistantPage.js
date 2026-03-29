import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import './AIAssistantPage.css';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const SUGGESTED_PROMPTS = [
  "Suggest a good laptop under ₹50,000",
  "What are the best smartphones right now?",
  "Help me find gifts for my mom",
  "Show me trending electronics",
  "Best deals on home appliances",
];

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm Flipkart's AI Shopping Assistant powered by Gemini. I can help you find products, suggest deals, compare items, and more! What are you looking for today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const searchProducts = async (query) => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, image_url, rating, category')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
      .order('rating', { ascending: false })
      .limit(4);
    return data || [];
  };

  const callGemini = async (userMessage, productContext) => {
    const systemPrompt = `You are a helpful Flipkart shopping assistant. You help users find products, compare options, and make purchasing decisions. Be concise, friendly, and helpful. 

${productContext ? `Available products matching the query:\n${productContext}\n\nRefer to these products in your response and recommend the best ones.` : ''}

Keep responses under 200 words. Use emojis sparingly. Format prices in ₹ (INR).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + '\n\nUser: ' + userMessage }
              ]
            }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble responding right now. Please try again.";
  };

  const handleSend = async (message = input) => {
    if (!message.trim() || loading) return;
    const userMsg = message.trim();
    setInput('');

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMsg,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      // Search products related to message
      const relatedProducts = await searchProducts(userMsg);
      setProducts(relatedProducts);

      let productContext = '';
      if (relatedProducts.length > 0) {
        productContext = relatedProducts.map(p =>
          `- ${p.name} | ₹${p.price?.toLocaleString()} | Rating: ${p.rating || 'N/A'} | Category: ${p.category}`
        ).join('\n');
      }

      const aiResponse = await callGemini(userMsg, productContext);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        products: relatedProducts,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please check your Gemini API key configuration.",
        timestamp: new Date()
      }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="ai-page">
      <div className="ai-container">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-avatar">🤖</div>
            <div>
              <h1 className="ai-title">Flipkart AI Assistant</h1>
              <p className="ai-subtitle">Powered by Google Gemini</p>
            </div>
          </div>
          <div className="ai-status">
            <span className="ai-online-dot" />
            Online
          </div>
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ${msg.role}`}>
              {msg.role === 'assistant' && <div className="ai-bot-avatar">🤖</div>}
              <div className="message-bubble">
                <p className="message-text">{msg.content}</p>
                <span className="message-time">
                  {msg.timestamp?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Product Cards in message */}
                {msg.products && msg.products.length > 0 && (
                  <div className="message-products">
                    {msg.products.map(p => (
                      <Link key={p.id} to={`/product/${p.id}`} className="ai-product-card">
                        <img src={p.image_url} alt={p.name} />
                        <div className="ai-product-info">
                          <div className="ai-product-name">{p.name}</div>
                          <div className="ai-product-price">₹{p.price?.toLocaleString()}</div>
                          {p.rating && <div className="ai-product-rating">{p.rating} ★</div>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-message assistant">
              <div className="ai-bot-avatar">🤖</div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <div className="ai-suggestions">
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                className="suggestion-chip"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-input-area">
          <input
            type="text"
            className="ai-input"
            placeholder="Ask me anything about shopping..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            className="ai-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
