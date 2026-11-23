import { useState } from 'react'
import { useInput } from '../../../hooks/useInput'
import { loginApi } from '../api/authApi'
import { showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [username, onUsernameChange] = useInput('')
  const [password, onPasswordChange] = useInput('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await loginApi({ username, password })
      await showSuccessAlert('Login Berhasil')
      onAuthSuccess(data)
      onClose()
    } catch (err) {
      await showErrorAlert('Login Gagal', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">Masuk ke Delcom Blog</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              required
              value={username}
              onChange={onUsernameChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={onPasswordChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer">
              Batal
            </button>
            <button id="login-submit" type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold cursor-pointer">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
