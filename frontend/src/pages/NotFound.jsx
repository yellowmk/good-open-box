import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="bg-gray-100 min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound.title')}</h2>
        <p className="text-gray-500 mb-6">
          {t('notFound.description')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition"
          >
            {t('notFound.goHome')}
          </Link>
          <Link
            to="/products"
            className="px-6 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition"
          >
            {t('notFound.browseProducts')}
          </Link>
        </div>
      </div>
    </div>
  )
}
