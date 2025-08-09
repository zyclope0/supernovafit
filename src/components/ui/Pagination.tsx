'use client'

interface PaginationProps {
  hasMore: boolean
  onLoadMore: () => void
}

export default function Pagination({ hasMore, onLoadMore }: PaginationProps) {
  if (!hasMore) return null
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={onLoadMore}
        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
      >
        Voir plus
      </button>
    </div>
  )
}


