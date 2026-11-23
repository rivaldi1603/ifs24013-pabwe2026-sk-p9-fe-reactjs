import { useState } from 'react'
import { useInput } from '../../../hooks/useInput'
import { loginApi, registerApi } from '../api/authApi'
import { showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

export default function AuthPage({ mode = 'login', onAuthSuccess, onNavigate }) {
  const [username, onUsernameChange] = useInput('')
  const [email, onEmailChange] = useInput('')
  const [password, onPasswordChange] = useInput('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = isRegister
        ? await registerApi({ username, email, password })
        : await loginApi({ username, password })
      await showSuccessAlert(isRegister ? 'Registrasi Berhasil' : 'Login Berhasil')
      onAuthSuccess(data)
    } catch (err) {
      await showErrorAlert('Autentikasi Gagal', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {isRegister ? 'Daftar Penulis Delcom Blog' : 'Masuk ke Delcom Blog'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isRegister
            ? 'Buat akun penulis untuk menulis artikel Markdown dan menggunakan AI Generator.'
            : 'Masuk untuk mengakses Workspace Penulis atau Admin Panel.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Masukkan username"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={onEmailChange}
                placeholder="penulis@delcom.org"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          )}

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
              placeholder="Masukkan password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {isRegister ? (
            <button type="button" onClick={() => onNavigate('/login')} className="text-blue-600 hover:underline cursor-pointer">
              Sudah punya akun? Masuk di sini
            </button>
          ) : (
            <button type="button" onClick={() => onNavigate('/register')} className="text-blue-600 hover:underline cursor-pointer">
              Belum punya akun? Daftar sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
