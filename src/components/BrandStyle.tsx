'use client'

import { useEffect } from 'react'

/**
 * Injects the saved brand color as a CSS custom property on <html>.
 * Other components can then reference var(--brand) in inline styles.
 * Must be rendered inside ConditionalLayout so it stays mounted.
 */
export default function BrandStyle() {
  useEffect(() => {
    function apply() {
      const color = localStorage.getItem('immogreta_brand_color') || '#2563eb'
      document.documentElement.style.setProperty('--brand', color)
    }
    apply()
    // Re-apply whenever the setting changes in another tab or the same tab
    const handler = (e: StorageEvent) => {
      if (e.key === 'immogreta_brand_color') apply()
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return null
}
