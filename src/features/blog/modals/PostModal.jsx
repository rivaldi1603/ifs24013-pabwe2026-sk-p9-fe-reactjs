import { useEffect, useState } from 'react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import { createPostApi, updatePostApi } from '../api/blogApi'
import { showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export default function PostModal({ isOpen, onClose, initialPost = null, theme = 'light', onSaved }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [excerpt, setExcerpt] = useState('')
  const [coverImagePath, setCoverImagePath] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (initialPost) {
      setTitle(initialPost.title || '')
      setCategory(initialPost.category || 'Teknologi')
      setExcerpt(initialPost.excerpt || '')
      setCoverImagePath(initialPost.cover_image_path || '')
      setContent(initialPost.content || '')
      setIsPublished(Boolean(initialPost.is_published))
    } else {
      setTitle('')
      setCategory('Teknologi')
      setExcerpt('')
      setCoverImagePath('')
      setContent('')
      setIsPublished(false)
    }
  }, [isOpen, initialPost])

  if (!isOpen) return null

  const isEditing = Boolean(initialPost?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      title,
      category,
      excerpt,
      content,
      cover_image_path: coverImagePath,
      is_published: isPublished,
    }
    try {
      if (isEditing) {
        await updatePostApi(initialPost.id, payload)
        await showSuccessAlert('Artikel Diperbarui')
      } else {
        await createPostApi(payload)
        await showSuccessAlert('Artikel Berhasil Dibuat')
      }
      onSaved()
      onClose()
    } catch (err) {
      await showErrorAlert('Gagal Menyimpan Artikel', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4" role="dialog" aria-modal="true">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[96vw] h-[94vh] flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700"
      >
        <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEditing ? 'Ubah Artikel Blog' : 'Tulis Artikel Baru'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="post-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Judul Artikel
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul artikel menarik..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="post-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-excerpt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Ringkasan (Excerpt)
              </label>
              <input
                id="post-excerpt"
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan pemikat 1-2 kalimat..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="post-cover" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                URL Gambar Sampul (Opsional)
              </label>
              <input
                id="post-cover"
                type="text"
                value={coverImagePath}
                onChange={(e) => setCoverImagePath(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publikasikan langsung ke halaman publik
          </label>

          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Konten Artikel (Markdown & WYSIWYG)
            </span>
            <MarkdownEditor value={content} onChange={setContent} theme={theme} />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
