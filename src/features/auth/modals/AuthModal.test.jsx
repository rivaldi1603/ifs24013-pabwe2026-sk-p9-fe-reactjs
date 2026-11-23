import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from './AuthModal'
import * as authApi from '../api/authApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

describe('AuthModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessAlert').mockResolvedValue({})
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('renders nothing when closed', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={vi.fn()} onAuthSuccess={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('handles login success, failure, and close buttons', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onAuthSuccess = vi.fn()
    vi.spyOn(authApi, 'loginApi')
      .mockRejectedValueOnce(new Error('Invalid credentials'))
      .mockResolvedValueOnce({ token: 'jwt', user: { id: 1 } })

    render(<AuthModal isOpen={true} onClose={onClose} onAuthSuccess={onAuthSuccess} />)

    await user.type(screen.getByLabelText('Username'), 'admin')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Login Gagal', 'Invalid credentials')
    })

    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith({ token: 'jwt', user: { id: 1 } })
      expect(onClose).toHaveBeenCalled()
    })

    await user.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
