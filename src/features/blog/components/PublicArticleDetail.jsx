import { useEffect, useState } from 'react'
import { IconArrowLeft, IconCalendar, IconClock, IconUser } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { getPublicPostBySlugApi } from '../api/blogApi'
import { formatDate, showErrorAlert } from '../../../helpers/toolsHelper'

export default function PublicArticleDetail({ slug, theme, onNavigate }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getPublicPostBySlugApi(slug)
      .then((data) => {
        if (active) setPost(data)
      })
      .catch((err) => {
        if (active) showErrorAlert('Artikel Tidak Ditemukan', err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return <div className="w-full px-6 py-10 text-slate-600 dark:text-slate-300">Memuat artikel...</div>
  }

  if (!post) {
    return (
      <div className="w-full px-6 py-10 space-y-4">
        <p className="text-slate-600 dark:text-slate-300">Artikel tidak ditemukan atau belum dipublikasikan.</p>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  return (
    <article className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
      >
        <IconArrowLeft size={16} />
        Kembali ke Galeri Artikel
      </button>

      <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            {post.category}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1">
              <IconUser size={16} aria-hidden="true" />
              {post.author_name || 'Delcom Author'}
            </span>
            <span className="inline-flex items-center gap-1">
              <IconCalendar size={16} aria-hidden="true" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <IconClock size={16} aria-hidden="true" />
              {post.reading_time} menit baca
            </span>
          </div>
        </div>

        {post.cover_image_path && (
          <img
            src={post.cover_image_path}
            alt={post.title}
            decoding="async"
            fetchPriority="high"
            className="w-full max-h-[420px] object-cover rounded-xl border border-slate-200 dark:border-slate-700"
          />
        )}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <MarkdownViewer content={post.content} theme={theme} />
        </div>
      </div>
    </article>
  )
}
