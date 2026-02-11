import { Component } from 'react'
import { Link } from 'react-router-dom'
import i18n from '../i18n'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const t = i18n.t.bind(i18n)
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gray-100">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('error.somethingWentWrong')}</h2>
            <p className="text-gray-500 mb-6">
              {t('error.unexpectedError')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition"
              >
                {t('error.refreshPage')}
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="px-6 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition"
              >
                {t('error.goHome')}
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
