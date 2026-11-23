import { useState } from 'react'
import { generateAiPostApi } from '../api/blogApi'
import { showErrorAlert } from '../../../helpers/toolsHelper'

const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export default function AiPostGeneratorModal({ isOpen, onClose, onApplyDraft }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [draft, setDraft] = useState(null)
  const [generating, setGenerating] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const res = await generateAiPostApi({
        topic,
        category,
        include_web_search: includeWebSearch,
      })
      setDraft(res)
    } catch (err) {
      await showErrorAlert('AI Blog Generator Gagal', err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleApply = () => {
    onApplyDraft({
      title: draft.title,
      category: draft.category,
      excerpt: draft.excerpt,
      content: draft.content,
      is_published: false,
    })
    setDraft(null)
    setTopic('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[96vw] h-[94vh] flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 bg-violet-700 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">AI Blog Generator + Live Search Engine</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="ai-topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Topik Artikel
              </label>
              <textarea
                id="ai-topic"
                required
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Dampak AI Generatif terhadap Produktivitas Developer 2026"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="ai-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Artikel
                </label>
                <select
                  id="ai-category"
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

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWebSearch}
                  onChange={(e) => setIncludeWebSearch(e.target.checked)}
                />
                Aktifkan Penelusuran Mesin Pencari (Live Search Engine)
              </label>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer"
            >
              {generating ? 'Menyusun Draf Artikel...' : 'Generate Draf Artikel AI'}
            </button>
          </form>

          {draft && (
            <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{draft.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  {draft.category}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">{draft.excerpt}</p>
              <pre className="whitespace-pre-wrap text-xs sm:text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto">
                {draft.content}
              </pre>

              {(draft.search_sources || []).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Sumber Rujukan Mesin Pencari ({draft.search_sources.length})
                  </p>
                  <ul className="space-y-1.5 text-xs">
                    {draft.search_sources.map((src, idx) => (
                      <li key={idx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {src.title}
                        </a>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{src.snippet}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
            type="button"
            disabled={!draft}
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 cursor-pointer"
          >
            Simpan & Terapkan ke Editor
          </button>
        </div>
      </div>
    </div>
  )
}
