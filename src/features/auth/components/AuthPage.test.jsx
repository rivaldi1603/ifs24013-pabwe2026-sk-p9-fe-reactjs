import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from './AuthPage'
import * as authApi from '../api/authApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

describe('AuthPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessAlert').mockResolvedValue({})
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('submits login form successfully and navigates to register', async () => {
    const user = userEvent.setup()
    const onAuthSuccess = vi.fn()
    const onNavigate = vi.fn()
    vi.spyOn(authApi, 'loginApi').mockResolvedValue({ token: 't', user: { id: 1 } })

    render(<AuthPage onAuthSuccess={onAuthSuccess} onNavigate={onNavigate} />)

    await user.type(screen.getByLabelText('Username'), 'member')
    await user.type(screen.getByLabelText('Password'), 'member')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith({ token: 't', user: { id: 1 } })
    })

    await user.click(screen.getByText('Belum punya akun? Daftar sekarang'))
    expect(onNavigate).toHaveBeenCalledWith('/register')
  })

  it('submits register form, handles errors, and navigates to login', async () => {
    const user = userEvent.setup()
    const onAuthSuccess = vi.fn()
    const onNavigate = vi.fn()
    vi.spyOn(authApi, 'registerApi')
      .mockRejectedValueOnce(new Error('Username taken'))
      .mockResolvedValueOnce({ token: 't2', user: { id: 2 } })

    render(<AuthPage mode="register" onAuthSuccess={onAuthSuccess} onNavigate={onNavigate} />)

    await user.type(screen.getByLabelText('Username'), 'penulis1')
    await user.type(screen.getByLabelText('Email'), 'penulis1@delcom.org')
    await user.type(screen.getByLabelText('Password'), 'Password123')

    await user.click(screen.getByRole('button', { name: 'Daftar Sekarang' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Autentikasi Gagal', 'Username taken')
    })

    await user.click(screen.getByRole('button', { name: 'Daftar Sekarang' }))
    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith({ token: 't2', user: { id: 2 } })
    })

    await user.click(screen.getByText('Sudah punya akun? Masuk di sini'))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })
})
