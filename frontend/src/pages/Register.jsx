import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordsNoMatch'))
      return
    }
    if (form.password.length < 6) {
      setError(t('auth.passwordMinLength'))
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || t('auth.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-100 min-h-[80vh] flex flex-col items-center pt-8 px-4">
      <Link to="/" className="mb-6">
        <img src="/logo-full.png" alt="Good Open Box" className="h-16" />
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h1 className="text-2xl font-normal text-gray-900 mb-4">{t('auth.createAccount')}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('auth.yourName')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('auth.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('auth.password')}</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('auth.reEnterPassword')}</label>
              <input
                type="password"
                required
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
              {loading ? t('auth.creatingAccount') : t('auth.createYourAccount')}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            {t('auth.termsCreate')}
          </p>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <p className="text-sm text-gray-700">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-amber-700 hover:underline">{t('auth.signIn')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
