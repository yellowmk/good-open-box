import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'EN', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { code: 'fr', label: 'FR', flag: '\ud83c\uddeb\ud83c\uddf7' },
  { code: 'es', label: 'ES', flag: '\ud83c\uddea\ud83c\uddf8' },
]

export default function LanguageSwitcher({ mobile }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  const current = languages.find((l) => l.code === i18n.language) || languages[0]

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  if (mobile) {
    return (
      <div className="flex items-center gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLang(lang.code)}
            className={`px-2.5 py-1.5 text-xs rounded-md font-medium transition ${
              i18n.language === lang.code
                ? 'bg-amber-400 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-300 hover:text-white hover:ring-1 hover:ring-white rounded transition"
      >
        <span>{current.flag}</span>
        <span className="font-medium text-xs">{current.label}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-amber-50 transition ${
                i18n.language === lang.code ? 'font-bold text-amber-700 bg-amber-50' : 'text-gray-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
