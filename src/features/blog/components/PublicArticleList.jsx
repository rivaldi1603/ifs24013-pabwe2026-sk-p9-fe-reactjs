import { useEffect, useState } from 'react'
import { IconClock, IconSearch, IconUser } from '@tabler/icons-react'
import { getPublicCategoriesApi, getPublicPostsApi } from '../api/blogApi'
import { formatDate, showErrorAlert } from '../../../helpers/toolsHelper'

export default function PublicArticleList({ user, onNavigate }) {
  const [categories, setCategories] = useState(['Semua'])
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getPublicCategoriesApi()
      .then((cats) => {
        if (active && Array.isArray(cats)) {
          setCategories(['Semua', ...cats])
        }
      })
      .catch(() => {
        if (active) {
          setCategories(['Semua', 'Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'])
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    getPublicPostsApi({ q: search, category: selectedCategory })
      .then((data) => {
        if (active) setPosts(data || [])
      })
      .catch((err) => {
        if (active) showErrorAlert('Gagal Memuat Artikel', err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [search, selectedCategory])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Jelajahi Artikel Delcom Blog</h1>
          <p className="text-sm sm:text-base text-blue-100 mt-1">
            Temukan wawasan teknologi, pendidikan, bisnis, dan opini terbaru dari para penulis kami.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => onNavigate('/author')}
              className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold text-sm cursor-pointer"
            >
              Tulis Artikel
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold text-sm cursor-pointer"
              >
                Login Penulis
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="px-4 py-2 rounded-lg bg-blue-800/80 hover:bg-blue-900 text-white font-semibold text-sm cursor-pointer"
              >
                Daftar Gratis
              </button>
            </>
          )}
        </div>
      </section>

      <div className="space-y-4">
        <div className="relative">
          <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Cari artikel publik"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, ringkasan, atau kata kunci artikel..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat artikel publik...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
          Belum ada artikel publik yang cocok dengan pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <IconClock size={14} />
                    {post.reading_time} menit baca
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/posts/${post.slug}`)}
                    className="text-left hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                  >
                    {post.title}
                  </button>
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{post.excerpt}</p>
              </div>

              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <IconUser size={14} />
                  {post.author_name || 'Delcom'}
                </span>
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
