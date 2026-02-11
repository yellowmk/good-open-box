import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'

export default function ResetPassword() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="bg-gray-100 min-h-[80vh] flex flex-col items-center pt-8 px-4">
        <Link to="/" className="mb-6">
          <img src="/logo-full.png" alt="Good Open Box" className="h-16" />
        </Link>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-md border border-gray-200 p-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('resetPassword.invalidLink')}</h1>
            <p className="text-sm text-gray-600 mb-4">
              {t('resetPassword.invalidLinkDesc')}
            </p>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              {t('resetPassword.requestNewLink')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError(t('auth.passwordMinLength'))
      return
    }
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordsNoMatch'))
      return
    }
    setLoading(true)
    try {
      await API.post('/auth/reset-password', { token, password: form.password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || t('resetPassword.failedToReset'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-gray-100 min-h-[80vh] flex flex-col items-center pt-8 px-4">
        <Link to="/" className="mb-6">
          <img src="/logo-full.png" alt="Good Open Box" className="h-16" />
        </Link>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-md border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('resetPassword.passwordReset')}</h1>
            <p className="text-sm text-gray-600 mb-4">
              {t('resetPassword.passwordResetSuccess')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition"
            >
              {t('common.signIn')}
            </button>
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
          <h1 className="text-2xl font-normal text-gray-900 mb-2">{t('resetPassword.createNewPassword')}</h1>
          <p className="text-sm text-gray-600 mb-4">
            {t('resetPassword.enterNewPassword')}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('resetPassword.newPassword')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="text-xs text-gray-400 mt-1">{t('resetPassword.minChars')}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('resetPassword.confirmPassword')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? t('resetPassword.resetting') : t('resetPassword.resetPassword')}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            {t('resetPassword.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  )
}
