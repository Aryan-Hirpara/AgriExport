import { useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';

export default function GoogleTranslateWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Define global callback if not yet defined
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'gu,hi,en,mr,pa,ta,te,bn,ar,fr,es,de',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        } catch (err) {
          console.warn('Google Translate initialization notice:', err);
        }
      }
    };

    // 2. Load Google Translate script if not already added
    const existingScript = document.getElementById('google-translate-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      // Re-trigger init if element was remounted
      try {
        const el = document.getElementById('google_translate_element');
        if (el && el.children.length === 0) {
          window.googleTranslateElementInit();
        }
      } catch (e) {
        // already active
      }
    }
  }, []);

  return (
    <div className="google-translate-wrapper" title="Translate website with Google Translate">
      <div className="google-translate-badge">
        <Globe size={15} color="var(--green-primary)" />
        <span className="google-translate-label">Google Translate</span>
      </div>
      <div id="google_translate_element" ref={containerRef} />
    </div>
  );
}
