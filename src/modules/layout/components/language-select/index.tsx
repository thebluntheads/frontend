"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { setCookie } from "cookies-next"
import { LANGUAGE_COOKIE } from "i18n/routing"

// Define language options with their native names and flags
interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇲🇽" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
]

interface LanguageSelectProps {
  minimal?: boolean
  align?: "left" | "right"
  showVideoText?: boolean
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({
  minimal = false,
  align = "right",
  showVideoText = false,
}) => {
  const locale = useLocale()
  const [currentLocale, setCurrentLocale] = useState<string>(locale || "")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update current locale when context locale changes
  useEffect(() => {
    if (locale) {
      setCurrentLocale(locale)
    }
  }, [locale])

  // Find current language object
  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleLanguageSelect = (code: string) => {
    // Set cookie with a long expiration (1 year)
    setCookie(LANGUAGE_COOKIE, code, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'strict'
    })
    
    // Update local state
    setCurrentLocale(code)
    setIsOpen(false)
    
    // Reload the page to apply the new locale
    window.location.reload()
  }

  // No loading state needed with cookie-based approach

  if (minimal) {
    return (
      <div className="relative flex flex-col items-center" ref={dropdownRef}>
        {showVideoText ? (
          <button
            onClick={toggleDropdown}
            className="text-white text-base font-bold hover:text-white/80 transition-colors"
            aria-label="Select language"
            aria-expanded={isOpen}
          >
            Click Here to Select Video Language
          </button>
        ) : (
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            aria-label="Select language"
            aria-expanded={isOpen}
          >
            <span className="text-lg">{currentLanguage.flag}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}

        {isOpen && (
          <div
            className={`absolute z-50 mt-2 ${
              align === "left" ? "left-0" : "right-0"
            } w-48 bg-black/90 backdrop-blur-xl border border-white/5 rounded-lg shadow-lg overflow-hidden`}
          >
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm ${
                    currentLanguage.code === language.code
                      ? "bg-dark-green/20 text-white"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                  aria-current={
                    currentLanguage.code === language.code ? "true" : "false"
                  }
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.nativeName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.nativeName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 ${
            align === "left" ? "left-0" : "right-0"
          } w-48 bg-black/90 backdrop-blur-xl border border-white/5 rounded-lg shadow-lg overflow-hidden`}
        >
          <div className="py-1 max-h-[300px] overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm ${
                  currentLanguage.code === language.code
                    ? "bg-dark-green/20 text-white"
                    : "text-white/80 hover:bg-white/5"
                }`}
                aria-current={
                  currentLanguage.code === language.code ? "true" : "false"
                }
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.nativeName}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelect
