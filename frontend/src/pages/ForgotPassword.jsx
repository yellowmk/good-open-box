import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await API.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || t('forgotPassword.failedToSend'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-gray-100 min-h-[80vh] flex flex-col items-center pt-8 px-4">
        <Link to="/" className="mb-6">
          <img src="/logo-full.png" alt="Good Open Box" className="h-16" />
        </Link>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-md border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('forgotPassword.checkEmail')}</h1>
            <p className="text-sm text-gray-600 mb-4">
              {t('forgotPassword.emailSentPlain', { email })}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {t('forgotPassword.didntReceive')}
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-sm text-blue-600 hover:underline"
            >
              {t('forgotPassword.tryDifferentEmail')}
            </button>
          </div>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              {t('forgotPassword.backToSignIn')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-[80vh] flex flex-col items-center pt-8 px-4">
      <Link to="/" className="mb-6">
        <img src="/logo-full.png" alt="Good Open Box" className="h-16" />
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h1 className="text-2xl font-normal text-gray-900 mb-2">{t('forgotPassword.title')}</h1>
          <p className="text-sm text-gray-600 mb-4">
            {t('forgotPassword.description')}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            {t('forgotPassword.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  )
}
