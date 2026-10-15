import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

// Fix for Google Translate DOM manipulation breaking React 18 virtual DOM
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console && console.warn) console.warn('Google Translate DOM safety: cannot remove child from different parent', child, this);
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && console.warn) console.warn('Google Translate DOM safety: cannot insert before different parent', referenceNode, this);
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

// Prevent Google Translate from shifting body down or covering the navbar
if (typeof window !== 'undefined') {
  const resetGoogleTranslateShift = () => {
    if (document.body && document.body.style.top && document.body.style.top !== '0px') {
      document.body.style.top = '0px';
    }
    const banners = document.querySelectorAll(
      '.goog-te-banner-frame, iframe.skiptranslate, .VIpgJd-ZVi9od-ORHb-Oxf5Fd, body > .skiptranslate'
    );
    banners.forEach((el) => {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('height', '0px', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    });
  };

  const observer = new MutationObserver(resetGoogleTranslateShift);
  observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', resetGoogleTranslateShift);
  window.addEventListener('load', resetGoogleTranslateShift);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
