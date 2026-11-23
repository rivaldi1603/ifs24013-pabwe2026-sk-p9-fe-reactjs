import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconPlus, IconSparkles } from '@tabler/icons-react'
import PostStats from './PostStats'
import {
  deletePostApi,
  getAuthorPostsApi,
  getAuthorStatsApi,
  togglePublishPostApi,
} from '../api/blogApi'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

const PostModal = lazy(() => import('../modals/PostModal'))
const AiPostGeneratorModal = lazy(() => import('../modals/AiPostGeneratorModal'))

const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export default function AuthorDashboard({ theme, onNavigate }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total_articles: 0, total_selesai: 0, belum_selesai: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [postsData, statsData] = await Promise.all([
        getAuthorPostsApi({ q: search, category: categoryFilter, status: statusFilter }),
        getAuthorStatsApi(),
      ])
      setPosts(postsData || [])
      setStats(statsData || { total_articles: 0, total_selesai: 0, belum_selesai: 0 })
    } catch (err) {
      await showErrorAlert('Gagal Memuat Workspace Penulis', err.message)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTogglePublish = async (id) => {
    try {
      await togglePublishPostApi(id)
      await showSuccessAlert('Status Publikasi Diperbarui')
      await loadData()
    } catch (err) {
      await showErrorAlert('Gagal Mengubah Status Publikasi', err.message)
    }
  }

  const handleDelete = async (id) => {
    setOpenMenuId(null)
    const confirmed = await showConfirmDialog('Hapus Artikel?', 'Artikel yang dihapus tidak dapat dikembalikan.')
    if (!confirmed) return
    try {
      await deletePostApi(id)
      await showSuccessAlert('Artikel Dihapus')
      await loadData()
    } catch (err) {
      await showErrorAlert('Gagal Menghapus Artikel', err.message)
    }
  }

  const handleApplyAiDraft = (draft) => {
    setEditingPost(draft)
    setPostModalOpen(true)
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Penulis</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Kelola draf dan publikasi artikel blog Anda atau buat draf otomatis dengan AI Generator.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium cursor-pointer"
          >
            <IconSparkles size={18} />
            AI Generator
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPost(null)
              setPostModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer"
          >
            <IconPlus size={18} />
            Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} activeStatus={statusFilter} onSelectStatus={setStatusFilter} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          aria-label="Cari artikel saya"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau konten artikel..."
          className="md:col-span-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
        />

        <select
          aria-label="Filter kategori penulis"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-600 dark:text-slate-300 py-6">Memuat daftar artikel...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-600 dark:text-slate-300">
          Belum ada artikel. Mulai menulis atau gunakan AI Generator sekarang!
        </div>
      ) : (
        <div className="overflow-visible rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Judul Artikel</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Waktu Baca</th>
                <th className="px-4 py-3">Publikasi</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <p>{post.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">{post.category}</td>
                  <td className="px-4 py-3">{post.reading_time} menit</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={post.is_published}
                      aria-label={`Toggle publikasi ${post.title}`}
                      onClick={() => handleTogglePublish(post.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                        post.is_published
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {post.is_published ? 'Terbit' : 'Draf'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {formatDate(post.published_at || post.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      type="button"
                      aria-label={`Menu ${post.title}`}
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <IconDotsVertical size={18} />
                    </button>
                    {openMenuId === post.id && (
                      <div className="absolute right-4 mt-1 w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-20 text-left">
                        {post.is_published && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null)
                              onNavigate(`/posts/${post.slug}`)
                            }}
                            className="block w-full px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            Baca Publik
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null)
                            setEditingPost(post)
                            setPostModalOpen(true)
                          }}
                          className="block w-full px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          Ubah Artikel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="block w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {postModalOpen && (
        <Suspense fallback={null}>
          <PostModal
            isOpen={postModalOpen}
            onClose={() => setPostModalOpen(false)}
            initialPost={editingPost}
            theme={theme}
            onSaved={loadData}
          />
        </Suspense>
      )}

      {aiModalOpen && (
        <Suspense fallback={null}>
          <AiPostGeneratorModal
            isOpen={aiModalOpen}
            onClose={() => setAiModalOpen(false)}
            onApplyDraft={handleApplyAiDraft}
          />
        </Suspense>
      )}
    </div>
  )
}
