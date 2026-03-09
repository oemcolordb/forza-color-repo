'use client'

import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import ColorCard from './ColorCard'

const OptimizedVirtualGrid = React.memo(
  ({ colors, favorites, onColorSelect, onToggleFavorite, isDarkMode, deviceInfo }) => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

    // Calculate grid dimensions based on device
    const gridConfig = useMemo(() => {
      const { isMobile, isTablet, screenSize } = deviceInfo

      if (isMobile) {
        return {
          columnCount: screenSize === 'sm' ? 2 : 3,
          itemWidth: screenSize === 'sm' ? 180 : 160,
          itemHeight: 200,
          gap: 8,
        }
      } else if (isTablet) {
        return {
          columnCount: 4,
          itemWidth: 180,
          itemHeight: 220,
          gap: 12,
        }
      } else {
        return {
          columnCount: Math.floor(containerSize.width / 200) || 6,
          itemWidth: 200,
          itemHeight: 240,
          gap: 16,
        }
      }
    }, [deviceInfo, containerSize.width])

    const rowCount = Math.ceil(colors.length / gridConfig.columnCount)

    // Memoized cell renderer for performance
    const Cell = useCallback(
      ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * gridConfig.columnCount + columnIndex
        const color = colors[index]

        if (!color) return null

        const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
        const isFavorite = favorites.includes(colorId)

        return (
          <div
            style={{
              ...style,
              padding: gridConfig.gap / 2,
              left: style.left + gridConfig.gap / 2,
              top: style.top + gridConfig.gap / 2,
              width: style.width - gridConfig.gap,
              height: style.height - gridConfig.gap,
            }}
          >
            <ColorCard
              color={color}
              onSelect={onColorSelect}
              isFavorite={isFavorite}
              onToggleFavorite={() => onToggleFavorite(colorId)}
              isDarkMode={isDarkMode}
              isMobile={deviceInfo.isMobile}
              isOptimized={true}
            />
          </div>
        )
      },
      [
        colors,
        favorites,
        onColorSelect,
        onToggleFavorite,
        isDarkMode,
        deviceInfo.isMobile,
        gridConfig,
      ]
    )

    // Container resize observer
    useEffect(() => {
      const updateSize = () => {
        const container = document.getElementById('color-grid-container')
        if (container) {
          setContainerSize({
            width: container.offsetWidth,
            height: Math.min(window.innerHeight * 0.7, 800),
          })
        }
      }

      updateSize()
      const resizeObserver = new ResizeObserver(updateSize)
      const container = document.getElementById('color-grid-container')

      if (container) {
        resizeObserver.observe(container)
      }

      return () => {
        if (container) {
          resizeObserver.unobserve(container)
        }
      }
    }, [])

    if (containerSize.width === 0) {
      return (
        <div id="color-grid-container" className="w-full h-96">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )
    }

    return (
      <div id="color-grid-container" className="w-full">
        <Grid
          columnCount={gridConfig.columnCount}
          columnWidth={gridConfig.itemWidth}
          height={containerSize.height}
          rowCount={rowCount}
          rowHeight={gridConfig.itemHeight}
          width={containerSize.width}
          overscanRowCount={2}
          overscanColumnCount={1}
          itemData={{ colors, favorites, onColorSelect, onToggleFavorite, isDarkMode, deviceInfo }}
        >
          {Cell}
        </Grid>
      </div>
    )
  }
)

OptimizedVirtualGrid.displayName = 'OptimizedVirtualGrid'

export default OptimizedVirtualGrid
