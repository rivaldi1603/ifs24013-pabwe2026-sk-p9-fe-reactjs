import { describe, it, expect, vi, beforeEach } from 'vitest'
import Swal from 'sweetalert2'
import {
  formatDate,
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
} from './toolsHelper'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}))

describe('toolsHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('formats dates and handles empty or invalid dates', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate(null)).toBe('-')
    expect(formatDate('not-a-date')).toBe('-')
    expect(formatDate('2026-11-23T00:00:00Z')).not.toBe('-')
  })

  it('triggers SweetAlert2 success, error, and confirm dialogs', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true })
    await showSuccessAlert('Berhasil', 'Artikel disimpan')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', title: 'Berhasil' }))

    await showErrorAlert('Gagal')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Gagal' }))

    const confirmed = await showConfirmDialog('Hapus?')
    expect(confirmed).toBe(true)

    Swal.fire.mockResolvedValue({ isConfirmed: false })
    const cancelled = await showConfirmDialog('Hapus?', 'Yakin?')
    expect(cancelled).toBe(false)
  })
})
