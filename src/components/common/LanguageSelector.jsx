import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', group: 'primary' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', group: 'primary' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', group: 'indian' },
  { code: 'mr', name: 'Marathi', native: 'मરાઠી', flag: '🇮🇳', group: 'indian' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', group: 'indian' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', group: 'indian' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', group: 'indian' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', group: 'indian' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇦🇪', group: 'export' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', group: 'export' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', group: 'export' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', group: 'export' },
];

export default function LanguageSelector({ variant = 'navbar' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCode, setActiveCode] = useState(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2,5})/);
    return match && match[1] ? match[1] : 'en';
  });
  const dropdownRef = useRef(null);

  // Read existing Google Translate cookie if present on mount
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2,5})/);
    if (match && match[1]) {
      setActiveCode(match[1]);
    }
  }, []);

  // Initialize hidden Google Translate engine in the DOM
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'gu,hi,en,mr,pa,ta,te,bn,ar,fr,es,de',
              autoDisplay: false,
            },
            'google_translate_hidden_container'
          );
        } catch (err) {
          console.warn('Google Translate init note:', err);
        }
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      try {
        const el = document.getElementById('google_translate_hidden_container');
        if (el && el.children.length === 0) {
          window.googleTranslateElementInit();
        }
      } catch (e) {
        // already initialized
      }
    }
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code) => {
    setActiveCode(code);
    setIsOpen(false);

    // Trigger Google Translate engine
    if (code === 'en') {
      // Clear translation cookies to revert to clean English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      }
    } else {
      document.cookie = `googtrans=/en/${code}; path=/;`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname};`;
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change'));
      }
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === activeCode) || LANGUAGES[0];
  const primaryLangs = LANGUAGES.filter((l) => l.group === 'primary');
  const indianLangs = LANGUAGES.filter((l) => l.group === 'indian');
  const exportLangs = LANGUAGES.filter((l) => l.group === 'export');

  return (
    <div className={`lang-selector-root notranslate ${variant}`} ref={dropdownRef} translate="no">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`lang-trigger-btn ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <span className="lang-trigger-name">{currentLang.native}</span>
        <ChevronDown
          size={14}
          className={`lang-trigger-chevron ${isOpen ? 'rotate' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={variant === 'sidebar' ? { opacity: 0, x: -12, scale: 0.97 } : { opacity: 0, y: 10, scale: 0.95 }}
            animate={variant === 'sidebar' ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={variant === 'sidebar' ? { opacity: 0, x: -12, scale: 0.97 } : { opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="lang-menu-dropdown"
          >
            {/* Dropdown Header */}
            <div className="lang-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="lang-header-icon">
                  <Globe size={16} />
                </div>
                <div>
                  <h4 className="lang-menu-title">Select Language / ભાષા</h4>
                  <p className="lang-menu-sub">Instant translation for all pages</p>
                </div>
              </div>
              <span className="lang-ai-badge">
                <Sparkles size={11} /> Google
              </span>
            </div>

            {/* Quick 2-Language Toggle Pills */}
            <div className="lang-quick-toggle">
              {primaryLangs.map((item) => {
                const isSelected = activeCode === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`lang-quick-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span>{item.flag}</span>
                    <span style={{ fontWeight: 600 }}>{item.native}</span>
                    {isSelected && <Check size={14} className="check-icon" />}
                  </button>
                );
              })}
            </div>

            <div className="lang-scroll-area">
              {/* Indian Regional Languages */}
              <div className="lang-section-group">
                <span className="lang-group-label">Indian Regional Languages</span>
                <div className="lang-grid">
                  {indianLangs.map((item) => {
                    const isSelected = activeCode === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleSelectLanguage(item.code)}
                        className={`lang-option-pill ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="lang-option-left">
                          <span className="lang-option-flag">{item.flag}</span>
                          <span className="lang-option-native">{item.native}</span>
                        </div>
                        <span className="lang-option-en">({item.name})</span>
                        {isSelected && <Check size={14} className="check-icon" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Export Market Languages */}
              <div className="lang-section-group">
                <span className="lang-group-label">Global Export Markets</span>
                <div className="lang-grid">
                  {exportLangs.map((item) => {
                    const isSelected = activeCode === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleSelectLanguage(item.code)}
                        className={`lang-option-pill ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="lang-option-left">
                          <span className="lang-option-flag">{item.flag}</span>
                          <span className="lang-option-native">{item.native}</span>
                        </div>
                        <span className="lang-option-en">({item.name})</span>
                        {isSelected && <Check size={14} className="check-icon" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="lang-menu-footer">
              <span>Automatic real-time translation powered by Google</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden native Google Translate element */}
      <div
        id="google_translate_hidden_container"
        style={{
          position: 'absolute',
          top: -9999,
          left: -9999,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
