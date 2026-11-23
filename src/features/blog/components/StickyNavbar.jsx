import { useState } from 'react'
import { IconMenu2, IconMoon, IconSun, IconX } from '@tabler/icons-react'

export default function StickyNavbar({ user, theme, onToggleTheme, onNavigate, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const go = (path) => {
    setMobileOpen(false)
    onNavigate(path)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go('/')}
          className="text-xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 cursor-pointer"
        >
          Delcom Blog
        </button>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <button type="button" onClick={() => go('/')} className="hover:text-blue-600 cursor-pointer">
            Beranda Publik
          </button>
          {user && (
            <button type="button" onClick={() => go('/author')} className="hover:text-blue-600 cursor-pointer">
              Workspace Penulis
            </button>
          )}
          {user?.role === 'admin' && (
            <button type="button" onClick={() => go('/admin')} className="hover:text-blue-600 cursor-pointer">
              Admin Panel
            </button>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle tema"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{user.username}</span>
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go('/login')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm cursor-pointer"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => go('/register')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer"
              >
                Daftar
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Menu mobile"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          {mobileOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 py-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900">
          <button type="button" onClick={() => go('/')} className="block w-full text-left py-1 text-sm cursor-pointer">
            Beranda Publik
          </button>
          {user ? (
            <>
              <button type="button" onClick={() => go('/author')} className="block w-full text-left py-1 text-sm cursor-pointer">
                Workspace Penulis
              </button>
              {user.role === 'admin' && (
                <button type="button" onClick={() => go('/admin')} className="block w-full text-left py-1 text-sm cursor-pointer">
                  Admin Panel
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  onLogout()
                }}
                className="block w-full text-left py-1 text-sm text-red-600 cursor-pointer"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => go('/login')} className="block w-full text-left py-1 text-sm cursor-pointer">
                Masuk
              </button>
              <button type="button" onClick={() => go('/register')} className="block w-full text-left py-1 text-sm cursor-pointer">
                Daftar
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
