'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TransitionType,
  TRANSITION_METADATA,
  TransitionMeta,
  PageTransition,
  getRandomTransition
} from './PageTransitions'
import { useTransition } from '../../context/TransitionContext'
import { Heart, Shuffle, Star, Play, Trophy, Settings2, Sparkles } from 'lucide-react'

// Demo button component for previewing transitions
const DemoButton: React.FC<{
  transition: TransitionMeta
  onPreview: (id: TransitionType) => void
  isPreviewing: boolean
}> = ({ transition, onPreview, isPreviewing }) => (
  <button
    onClick={() => onPreview(transition.id)}
    disabled={isPreviewing}
    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700
               disabled:bg-gray-900 disabled:opacity-50 rounded-lg text-sm
               font-medium transition-all border border-gray-700"
    style={{ borderColor: isPreviewing ? transition.color : undefined }}
  >
    <Play className="w-4 h-4" />
    {isPreviewing ? 'Playing...' : 'Preview'}
  </button>
)

// Heart/Vote button with animation
const VoteButton: React.FC<{
  transition: TransitionMeta
  votes: number
  hasVoted: boolean
  isLoading: boolean
  onVote: () => void
}> = ({ transition, votes, hasVoted, isLoading, onVote }) => (
  <button
    onClick={onVote}
    disabled={isLoading}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                transition-all transform active:scale-95 ${
      hasVoted
        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
    }`}
  >
    <motion.div
      animate={hasVoted ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Heart
        className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`}
      />
    </motion.div>
    <span className="min-w-[2rem] text-center">{votes}</span>
  </button>
)

// Favorite star button
const FavoriteButton: React.FC<{
  transitionId: TransitionType
  isFavorite: boolean
  onToggle: () => void
}> = ({ isFavorite, onToggle }) => (
  <button
    onClick={onToggle}
    className={`p-2 rounded-lg transition-all ${
      isFavorite
        ? 'text-yellow-400 bg-yellow-400/10'
        : 'text-gray-500 hover:text-yellow-400 hover:bg-gray-800'
    }`}
  >
    <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
  </button>
)

// Style badge
const StyleBadge: React.FC<{ style: TransitionMeta['style'] }> = ({ style }) => {
  const styleConfig: Record<TransitionMeta['style'], { color: string; label: string }> = {
    subtle: { color: '#8b5cf6', label: 'Subtle' },
    modern: { color: '#3b82f6', label: 'Modern' },
    elegant: { color: '#f97316', label: 'Elegant' },
  }

  const config = styleConfig[style]

  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color
      }}
    >
      {config.label}
    </span>
  )
}

// Individual transition card
const TransitionCard: React.FC<{
  transition: TransitionMeta
  votes: number
  hasVoted: boolean
  isFavorite: boolean
  isLoadingVotes: boolean
  isPreviewing: boolean
  onPreview: (id: TransitionType) => void
  onVote: () => void
  onToggleFavorite: () => void
  rank?: number
}> = ({
  transition,
  votes,
  hasVoted,
  isFavorite,
  isLoadingVotes,
  isPreviewing,
  onPreview,
  onVote,
  onToggleFavorite,
  rank
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl
                 overflow-hidden hover:border-gray-700 transition-all group"
    >
      {/* Rank badge for leaderboard */}
      {rank && rank <= 3 && (
        <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center
                        justify-center font-bold text-sm z-10 ${
          rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
          rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/50' :
          'bg-orange-600/20 text-orange-400 border border-orange-600/50'
        }`}>
          #{rank}
        </div>
      )}

      {/* Header with gradient */}
      <div
        className="h-24 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${transition.color}30 0%, transparent 60%)`
        }}
      >
        {/* Animated background pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${transition.color}40 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Icon */}
        <div className="absolute bottom-4 right-4 text-5xl opacity-30">
          {transition.icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">
              {transition.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StyleBadge style={transition.style} />
              <span className="text-xs text-gray-500">
                {transition.duration}ms
              </span>
            </div>
          </div>
          <FavoriteButton
            transitionId={transition.id}
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
          />
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {transition.description}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <DemoButton
            transition={transition}
            onPreview={onPreview}
            isPreviewing={isPreviewing}
          />
          <VoteButton
            transition={transition}
            votes={votes}
            hasVoted={hasVoted}
            isLoading={isLoadingVotes}
            onVote={onVote}
          />
        </div>
      </div>

      {/* Color accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: transition.color }}
      />
    </motion.div>
  )
}

// Main gallery component
export const TransitionGallery: React.FC = () => {
  const {
    votes,
    userVotes,
    voteForTransition,
    removeVote,
    hasVoted,
    isLoadingVotes,
    userFavorites,
    toggleFavorite,
    isFavorite,
    setFixedTransition,
    setRandomMode,
    mode,
  } = useTransition()

  const [previewingId, setPreviewingId] = useState<TransitionType | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'leaderboard'>('all')
  const [filterStyle, setFilterStyle] = useState<TransitionMeta['style'] | 'all'>('all')

  // Handle preview
  const handlePreview = (id: TransitionType) => {
    setPreviewingId(id)
    setTimeout(() => setPreviewingId(null), TRANSITION_METADATA.find(t => t.id === id)?.duration || 1500)
  }

  // Handle vote toggle
  const handleVote = async (id: TransitionType) => {
    if (hasVoted(id)) {
      await removeVote(id)
    } else {
      await voteForTransition(id)
    }
  }

  // Filter transitions
  const filteredTransitions = TRANSITION_METADATA.filter(t => {
    if (activeTab === 'favorites') return isFavorite(t.id)
    if (filterStyle !== 'all') return t.style === filterStyle
    return true
  })

  // Sort by votes for leaderboard
  const sortedByVotes = [...TRANSITION_METADATA].sort((a, b) =>
    (votes[b.id] || 0) - (votes[a.id] || 0)
  )

  const displayTransitions = activeTab === 'leaderboard'
    ? sortedByVotes
    : filteredTransitions

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)
  const leadingTransition = sortedByVotes[0]

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Active transition overlay */}
      <PageTransition
        type={previewingId || 'soft-fade'}
        isActive={!!previewingId}
        onComplete={() => setPreviewingId(null)}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Transition Gallery</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Experience 10 unique page transition animations. Vote for your favorites with the heart button
          and help us decide which transition style will become the default!
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Trophy className="w-4 h-4" />
            Total Votes Cast
          </div>
          <div className="text-2xl font-bold text-white">{totalVotes.toLocaleString()}</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Star className="w-4 h-4" />
            Current Leader
          </div>
          <div className="text-2xl font-bold" style={{ color: leadingTransition?.color }}>
            {leadingTransition?.name || 'Loading...'}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Settings2 className="w-4 h-4" />
            Your Mode
          </div>
          <div className="text-2xl font-bold text-white capitalize flex items-center gap-2">
            {mode === 'random' ? (
              <><Shuffle className="w-5 h-5" /> Random</>
            ) : (
              'Fixed'
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-800 rounded-xl p-1">
          {(['all', 'favorites', 'leaderboard'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'all' && 'All Transitions'}
              {tab === 'favorites' && `Favorites (${userFavorites.length})`}
              {tab === 'leaderboard' && 'Leaderboard'}
            </button>
          ))}
        </div>

        {/* Style filter */}
        <select
          value={filterStyle}
          onChange={(e) => setFilterStyle(e.target.value as TransitionMeta['style'] | 'all')}
          className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-2
                     text-sm text-gray-300 focus:outline-none focus:border-gray-600"
        >
          <option value="all">All Styles</option>
          <option value="cinematic">Cinematic</option>
          <option value="tech">Tech</option>
          <option value="retro">Retro</option>
          <option value="sporty">Sporty</option>
          <option value="abstract">Abstract</option>
        </select>
      </div>

      {/* Mode selection */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
        <span className="text-sm text-gray-400">Preferred Mode:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={setRandomMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       transition-all ${
              mode === 'random'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            Random Rotation
          </button>
          <span className="text-gray-600">or</span>
          <select
            onChange={(e) => setFixedTransition(e.target.value as TransitionType)}
            value={mode === 'fixed' ? 'fixed' : ''}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                       text-sm text-gray-300 focus:outline-none"
          >
            <option value="">Select Fixed Transition...</option>
            {TRANSITION_METADATA.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {displayTransitions.map((transition, index) => (
            <TransitionCard
              key={transition.id}
              transition={transition}
              votes={votes[transition.id] || 0}
              hasVoted={hasVoted(transition.id)}
              isFavorite={isFavorite(transition.id)}
              isLoadingVotes={isLoadingVotes}
              isPreviewing={previewingId === transition.id}
              onPreview={handlePreview}
              onVote={() => handleVote(transition.id)}
              onToggleFavorite={() => toggleFavorite(transition.id)}
              rank={activeTab === 'leaderboard' ? index + 1 : undefined}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {displayTransitions.length === 0 && (
        <div className="text-center py-16">
          <Star className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No transitions found</p>
          <p className="text-gray-600 text-sm">
            {activeTab === 'favorites'
              ? 'Star some transitions to see them here'
              : 'Try adjusting your filters'}
          </p>
        </div>
      )}
    </div>
  )
}

export default TransitionGallery
