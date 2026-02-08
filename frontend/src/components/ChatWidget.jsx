import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await API.post('/ai/chat', {
        messages: updatedMessages.filter(m => m.role === 'user' || m.role === 'assistant'),
      })
      const { reply, products: foundProducts } = res.data
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (foundProducts?.length > 0) setProducts(foundProducts)
    } catch (err) {
      const errorMsg = err.response?.status === 429
        ? 'Too many messages. Please wait a moment and try again.'
        : err.response?.status === 503
        ? 'AI assistant is not available right now.'
        : 'Something went wrong. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setProducts([])
  }

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition z-50"
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 w-96 max-w-[calc(100vw-2.5rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-amber-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Shopping Assistant</h3>
                <p className="text-xs text-gray-500">Ask me about products</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 hover:bg-gray-100 rounded"
              title="Clear chat"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-3">Hi! I can help you find products, compare items, and get recommendations.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Show me headphones', 'Laptops under $500', 'What categories do you have?'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-amber-50 text-gray-700 rounded-full transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Product Cards */}
            {products.length > 0 && messages.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-gray-500 font-medium">Products found:</p>
                {products.slice(0, 4).map(p => (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-amber-50 rounded-md border border-gray-100 transition"
                  >
                    <div className="w-10 h-10 bg-white rounded border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-900">${p.price?.toFixed(2)}</span>
                        {p.condition && <span className="capitalize">{p.condition}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-3 py-2 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
