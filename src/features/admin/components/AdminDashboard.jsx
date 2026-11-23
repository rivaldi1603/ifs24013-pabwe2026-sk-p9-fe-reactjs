import { useEffect, useState } from 'react'
import { getAdminPostsApi, getAdminUserPostsApi, getAdminUsersApi } from '../api/adminApi'
import { formatDate, showErrorAlert } from '../../../helpers/toolsHelper'

export default function AdminDashboard({ onNavigate }) {
  const [users, setUsers] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getAdminUsersApi(), getAdminPostsApi()])
      .then(([usersData, postsData]) => {
        if (!active) return
        setUsers(usersData || [])
        setAllPosts(postsData || [])
      })
      .catch((err) => {
        if (active) showErrorAlert('Gagal Memuat Panel Admin', err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleSelectUser = async (u) => {
    setSelectedUser(u)
    try {
      const posts = await getAdminUserPostsApi(u.id)
      setUserPosts(posts || [])
    } catch (err) {
      await showErrorAlert('Gagal Memuat Artikel Penulis', err.message)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel — Delcom Blog</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitoring seluruh pengguna terdaftar dan arsip artikel dari semua penulis dalam sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border-l-4 border-blue-500 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-500">Total Pengguna</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</p>
        </div>
        <div className="rounded-xl border-l-4 border-emerald-500 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-500">Total Artikel Sistem</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{allPosts.length}</p>
        </div>
        <div className="rounded-xl border-l-4 border-violet-500 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-500">Artikel Terbit</p>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {allPosts.filter((p) => p.is_published).length}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat data administrasi...</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Direktori Pengguna</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Total Artikel</th>
                    <th className="px-4 py-3">Terbit</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="px-4 py-3">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.username}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700">{u.role}</span>
                      </td>
                      <td className="px-4 py-3">{u.total_articles}</td>
                      <td className="px-4 py-3">{u.total_published}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium cursor-pointer"
                        >
                          Lihat Artikel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {selectedUser && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Artikel Milik: {selectedUser.username}
              </h2>
              {userPosts.length === 0 ? (
                <p className="text-sm text-slate-500">Penulis ini belum memiliki artikel.</p>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                  {userPosts.map((p) => (
                    <li key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{p.title}</span>
                      <span className="text-xs text-slate-500">
                        {p.category} • {p.is_published ? 'Terbit' : 'Draf'} • {formatDate(p.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Arsip Seluruh Postingan Blog</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Penulis</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Waktu Baca</th>
                    <th className="px-4 py-3">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {allPosts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="px-4 py-3 font-medium">
                        {p.is_published ? (
                          <button
                            type="button"
                            onClick={() => onNavigate(`/posts/${p.slug}`)}
                            className="text-left text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            {p.title}
                          </button>
                        ) : (
                          <span>{p.title}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{p.author?.username || '-'}</td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            p.is_published
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {p.is_published ? 'Terbit' : 'Draf'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{p.reading_time} menit</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(p.published_at || p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
