import { useState } from 'react'
import API from '../api/axios'

export default function AiDescriptionGenerator({ form, onGenerated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!form.name) {
      setError('Enter a product name first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await API.post('/ai/generate-description', {
        name: form.name,
        brand: form.brand,
        category: form.category,
        condition: form.condition,
        price: form.price,
        tags: typeof form.tags === 'string'
          ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
          : form.tags,
      })
      onGenerated(res.data.description)
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment.')
      } else if (err.response?.status === 503) {
        setError('AI features are not available.')
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Only vendors and admins can use this feature.')
      } else {
        setError('Failed to generate description. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate with AI
          </>
        )}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
