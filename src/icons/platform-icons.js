// Platform Icons - Simple SVG Data URLs for Real Platform Logos
// These are simplified, legally-safe versions inspired by actual platform designs

const PlatformIcons = {
  // Email Platforms
  email: {
    gmail: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#EA4335"/>
        <path d="M4 6l8 5 8-5v12H4V6z" fill="white"/>
        <path d="M4 6l8 5 8-5" stroke="white" stroke-width="1" fill="none"/>
      </svg>
    `)}`,

    outlook: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0078D4"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
        <text x="12" y="16" text-anchor="middle" fill="#0078D4" font-family="Arial" font-size="8" font-weight="bold">O</text>
      </svg>
    `)}`,

    generic: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#6B7280"/>
        <rect x="4" y="6" width="16" height="12" rx="2" fill="white"/>
        <path d="M4 8l8 4 8-4" stroke="#6B7280" stroke-width="1" fill="none"/>
      </svg>
    `)}`
  },

  // Messaging Platforms
  messaging: {
    whatsapp: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#25D366"/>
        <circle cx="12" cy="12" r="8" fill="white"/>
        <path d="M8 12l2 2 4-4" stroke="#25D366" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="6" stroke="#25D366" stroke-width="1" fill="none"/>
      </svg>
    `)}`,

    telegram: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0088CC"/>
        <path d="M6 12l4 4 8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="8" stroke="white" stroke-width="1" fill="none"/>
      </svg>
    `)}`,

    signal: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#3A76F0"/>
        <rect x="8" y="6" width="8" height="12" rx="2" fill="white"/>
        <circle cx="12" cy="10" r="1" fill="#3A76F0"/>
        <rect x="10" y="12" width="4" height="4" fill="#3A76F0"/>
      </svg>
    `)}`
  },

  // Team Collaboration Platforms
  team: {
    slack: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#4A154B"/>
        <rect x="6" y="6" width="3" height="12" fill="#E01E5A"/>
        <rect x="6" y="6" width="12" height="3" fill="#36C5F0"/>
        <rect x="15" y="6" width="3" height="12" fill="#2EB67D"/>
        <rect x="6" y="15" width="12" height="3" fill="#ECB22E"/>
      </svg>
    `)}`,

    teams: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#5059C9"/>
        <circle cx="9" cy="9" r="2" fill="white"/>
        <circle cx="15" cy="9" r="2" fill="white"/>
        <rect x="6" y="14" width="12" height="6" rx="2" fill="white"/>
      </svg>
    `)}`,

    discord: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#5865F2"/>
        <ellipse cx="12" cy="12" rx="8" ry="6" fill="white"/>
        <circle cx="9" cy="10" r="1" fill="#5865F2"/>
        <circle cx="15" cy="10" r="1" fill="#5865F2"/>
        <path d="M8 14c1 2 3 2 4 2s3 0 4-2" stroke="#5865F2" stroke-width="1" fill="none" stroke-linecap="round"/>
      </svg>
    `)}`
  },

  // Universal/Generic Icons
  universal: {
    copy: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#6B7280"/>
        <rect x="6" y="6" width="8" height="10" rx="1" fill="white"/>
        <rect x="10" y="8" width="8" height="10" rx="1" fill="none" stroke="white" stroke-width="1"/>
      </svg>
    `)}`,

    share: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#6B7280"/>
        <circle cx="7" cy="12" r="2" fill="white"/>
        <circle cx="17" cy="8" r="2" fill="white"/>
        <circle cx="17" cy="16" r="2" fill="white"/>
        <line x1="9" y1="12" x2="15" y2="9" stroke="white" stroke-width="1"/>
        <line x1="9" y1="12" x2="15" y2="15" stroke="white" stroke-width="1"/>
      </svg>
    `)}`,

    link: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#6B7280"/>
        <rect x="6" y="10" width="5" height="4" rx="2" fill="white"/>
        <rect x="13" y="10" width="5" height="4" rx="2" fill="white"/>
        <rect x="10" y="11" width="4" height="2" fill="white"/>
      </svg>
    `)}`
  }
};

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlatformIcons;
} else {
  window.PlatformIcons = PlatformIcons;
}
