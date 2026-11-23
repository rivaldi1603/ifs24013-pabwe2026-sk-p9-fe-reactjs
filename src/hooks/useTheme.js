import { useEffect, useState } from 'react'

const THEME_KEY = 'delcom_blog_theme'
const ACCENT_KEY = 'delcom_blog_accent'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [accent, setAccent] = useState(() => localStorage.getItem(ACCENT_KEY) || 'blue')

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    localStorage.setItem(ACCENT_KEY, accent)
    document.documentElement.setAttribute('data-accent', accent)
  }, [accent])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme, accent, setAccent }
}
