export default function PostStats({ stats = { total_articles: 0, total_selesai: 0, belum_selesai: 0 }, activeStatus = '', onSelectStatus }) {
  const cards = [
    {
      key: '',
      label: 'Total Artikel',
      value: stats.total_articles,
      border: 'border-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
    },
    {
      key: 'published',
      label: 'Total Terbit',
      value: stats.total_selesai,
      border: 'border-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      key: 'draft',
      label: 'Belum Selesai / Draf',
      value: stats.belum_selesai,
      border: 'border-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => {
        const selected = activeStatus === card.key
        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectStatus(card.key)}
            className={`text-left rounded-xl border-l-4 ${card.border} p-4 bg-white dark:bg-slate-800 shadow-sm transition cursor-pointer ${
              selected ? 'ring-2 ring-blue-500' : 'border border-slate-200 dark:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {card.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${card.text}`}>{card.value}</p>
          </button>
        )
      })}
    </div>
  )
}
