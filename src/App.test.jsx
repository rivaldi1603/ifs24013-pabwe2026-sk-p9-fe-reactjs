import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as authApi from './features/auth/api/authApi'

vi.mock('./features/auth/components/AuthPage', () => ({
  default: ({ mode, onAuthSuccess }) => (
    <div data-testid={`auth-page-${mode}`}>
      <button
        type="button"
        onClick={() => onAuthSuccess({ token: 'tok', user: { id: 1, username: 'admin', role: 'admin' } })}
      >
        LoginAsAdmin
      </button>
      <button
        type="button"
        onClick={() => onAuthSuccess({ token: 'tok2', user: { id: 2, username: 'member', role: 'member' } })}
      >
        LoginAsMember
      </button>
    </div>
  ),
}))

vi.mock('./features/blog/components/PublicArticleList', () => ({
  default: ({ onNavigate }) => (
    <div data-testid="public-list">
      <button type="button" onClick={() => onNavigate('/posts/hello-world')}>OpenArticle</button>
    </div>
  ),
}))

vi.mock('./features/blog/components/PublicArticleDetail', () => ({
  default: ({ slug }) => <div data-testid="public-detail">Detail {slug}</div>,
}))

vi.mock('./features/blog/components/AuthorDashboard', () => ({
  default: () => <div data-testid="author-dashboard">AuthorWorkspace</div>,
}))

vi.mock('./features/admin/components/AdminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">AdminPanel</div>,
}))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('handles multi-tier SPA routing, popstate, auth guards, login, and logout', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('public-list')).toBeInTheDocument()

    // Navigate to article detail
    await user.click(screen.getByText('OpenArticle'))
    expect(screen.getByTestId('public-detail')).toHaveTextContent('Detail hello-world')

    // Guest visiting /author redirects to login; visiting /admin falls back to public list
    act(() => {
      window.history.pushState({}, '', '/author')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByTestId('auth-page-login')).toBeInTheDocument()

    act(() => {
      window.history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByTestId('public-list')).toBeInTheDocument()

    // Navigate to /register and login as member -> /author
    await user.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByTestId('auth-page-register')).toBeInTheDocument()
    await user.click(screen.getByText('LoginAsMember'))
    expect(screen.getByTestId('author-dashboard')).toBeInTheDocument()

    // Logout with network error fallback
    vi.spyOn(authApi, 'logoutApi').mockRejectedValueOnce(new Error('net'))
    await user.click(screen.getByRole('button', { name: 'Keluar' }))
    await waitFor(() => expect(screen.getByTestId('public-list')).toBeInTheDocument())

    // Navigate to /login, login as admin -> /admin
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    await user.click(screen.getByText('LoginAsAdmin'))
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()

    // Navigate same path branch
    await user.click(screen.getByText('Admin Panel'))
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()

    // Logout cleanly
    vi.spyOn(authApi, 'logoutApi').mockResolvedValueOnce({})
    await user.click(screen.getByRole('button', { name: 'Keluar' }))
    await waitFor(() => expect(screen.getByTestId('public-list')).toBeInTheDocument())
  })
})
