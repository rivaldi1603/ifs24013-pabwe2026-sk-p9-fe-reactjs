import { lazy, Suspense, useEffect, useState } from 'react'
import {
  getStoredUser,
  removeStoredUser,
  removeToken,
  setStoredUser,
  setToken,
} from './helpers/apiHelper'
import { useTheme } from './hooks/useTheme'
import { logoutApi } from './features/auth/api/authApi'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'

const AuthPage = lazy(() => import('./features/auth/components/AuthPage'))
const PublicArticleDetail = lazy(() => import('./features/blog/components/PublicArticleDetail'))
const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'))

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [user, setUser] = useState(() => getStoredUser())
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setPathname(nextPath)
  }

  const handleAuthSuccess = (data) => {
    setToken(data.token)
    setStoredUser(data.user)
    setUser(data.user)
    navigate(data.user.role === 'admin' ? '/admin' : '/author')
  }

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore network error on logout and clear local session
    }
    removeToken()
    removeStoredUser()
    setUser(null)
    navigate('/')
  }

  const renderPage = () => {
    if (pathname === '/login') {
      return <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} onNavigate={navigate} />
    }
    if (pathname === '/register') {
      return <AuthPage mode="register" onAuthSuccess={handleAuthSuccess} onNavigate={navigate} />
    }
    if (pathname === '/author') {
      if (!user) {
        return <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} onNavigate={navigate} />
      }
      return <AuthorDashboard theme={theme} onNavigate={navigate} />
    }
    if (pathname === '/admin') {
      if (user?.role === 'admin') {
        return <AdminDashboard onNavigate={navigate} />
      }
      return <PublicArticleList user={user} onNavigate={navigate} />
    }
    if (pathname.startsWith('/posts/')) {
      const slug = pathname.replace('/posts/', '')
      return <PublicArticleDetail slug={slug} theme={theme} onNavigate={navigate} />
    }
    return <PublicArticleList user={user} onNavigate={navigate} />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <StickyNavbar
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      <main>
        <Suspense fallback={<div className="w-full px-6 py-10 text-slate-600 dark:text-slate-300">Memuat halaman...</div>}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  )
}
