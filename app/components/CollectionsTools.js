'use client'

import React from 'react'

const CollectionsTools = ({
  isDarkMode,
  favoritesCount,
  onOpenComparison,
  onShareFavorites,
  onExportFavoritesJson,
  onExportFavoritesCss,
  onImportFavorites,
}) => {
  return (
    <section className={`mb-5 rounded-2xl p-4 md:p-5 ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="premium-title text-lg font-bold text-white">Collection Studio</h2>
          <p className="text-xs text-white/60">Manage favorites, share collection links, and launch paint comparison</p>
        </div>
        <div className="text-xs text-white/65">Favorites in collection: {favoritesCount}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <button
          onClick={onOpenComparison}
          className="bamboo-button tap-target px-3 py-2 text-xs md:text-sm"
          type="button"
        >
          Open Comparison
        </button>

        <button
          onClick={onShareFavorites}
          className="bamboo-button-ghost tap-target px-3 py-2 text-xs md:text-sm"
          type="button"
          disabled={favoritesCount === 0}
        >
          Share Collection
        </button>

        <button
          onClick={onExportFavoritesJson}
          className="bamboo-button-ghost tap-target px-3 py-2 text-xs md:text-sm"
          type="button"
          disabled={favoritesCount === 0}
        >
          Export JSON
        </button>

        <button
          onClick={onExportFavoritesCss}
          className="bamboo-button-ghost tap-target px-3 py-2 text-xs md:text-sm"
          type="button"
          disabled={favoritesCount === 0}
        >
          Export CSS
        </button>

        <label className="bamboo-button-ghost tap-target flex cursor-pointer items-center justify-center px-3 py-2 text-xs md:text-sm">
          Import JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0]
              if (file) onImportFavorites(file)
              event.currentTarget.value = ''
            }}
          />
        </label>
      </div>
    </section>
  )
}

export default CollectionsTools
