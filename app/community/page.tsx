'use client'




import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PostModal from '@/components/color/PostModal'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import LazyImage from '@/components/ui/LazyImage'

interface Post {
  id: string
  username: string
  image_url: string
  caption: string
  car_name?: string
  tune_code?: string
  likes: number
  created_at: string
}

const SUGGESTED_TAGS = [
  'drift',
  'racing',
  'showcase',
  'drift build',
  'street',
  'track',
  'JDM',
  'Euro',
  'muscle',
  'livery',
]
const PAGE_SIZE = 6

import ClientOnly from '@/components/system/ClientOnly'



export default function CommunityPage() {
  return <ClientOnly>
        <CommunityPageInner />
      </ClientOnly>
}

function CommunityPageInner() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState<'feed' | 'tunebot'>('tunebot')
  const [posts, setPosts] = useState<Post[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Feed enhancements
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [likeAnimations, setLikeAnimations] = useState<Record<string, boolean>>({})
  const feedEndRef = useRef<HTMLDivElement>(null)

  // Community trends
  const [communityTrends, setCommunityTrends] = useState<any>(null)
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)
  const [trendsError, setTrendsError] = useState<string | null>(null)

  // Chat
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, status } = useChat({
    messages: [
      {
        id: 'welcome-msg',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Welcome to The Pit Stop! 🏁 I am TuneBot, your AI racing engineer. Need help fixing understeer, setting up a drift build, or finding the perfect color match? Let me know what you are driving!' }],
      } as import('@ai-sdk/react').UIMessage,
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const handleInputChange = (e: any) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: input }],
    } as import('@ai-sdk/react').UIMessage);
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchPosts = useCallback(() => {
    setIsLoadingPosts(true)
    fetch('/api/community/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setIsLoadingPosts(false)
      })
      .catch(err => {
        console.error('Fetch posts error:', err)
        setIsLoadingPosts(false)
      })
  }, [])

  const fetchCommunityTrends = useCallback(async () => {
    setIsLoadingTrends(true)
    setTrendsError(null)

    try {
      const res = await fetch('/api/analytics/community-trends')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error ? String(data.error) : `HTTP ${res.status}`)
      }
      setCommunityTrends(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setTrendsError(msg)
      setCommunityTrends(null)
    } finally {
      setIsLoadingTrends(false)
    }
  }, [])

  useEffect(() => {
    fetchCommunityTrends()
  }, [fetchCommunityTrends])

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchPosts()
      setDisplayCount(PAGE_SIZE)
    }
  }, [activeTab, fetchPosts])

  // Memoized filtered + sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        p =>
          p.caption?.toLowerCase().includes(q) ||
          p.car_name?.toLowerCase().includes(q) ||
          p.username?.toLowerCase().includes(q) ||
          p.tune_code?.toLowerCase().includes(q)
      )
    }

    // Tag filter
    if (selectedTag) {
      const tag = selectedTag.toLowerCase()
      result = result.filter(
        p => p.caption?.toLowerCase().includes(tag) || p.car_name?.toLowerCase().includes(tag)
      )
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => b.likes - a.likes)
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [posts, searchQuery, selectedTag, sortBy])

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, displayCount),
    [filteredPosts, displayCount]
  )

  // Intersection observer for infinite scroll (must be after filteredPosts declaration)
  useEffect(() => {
    if (!feedEndRef.current || activeTab !== 'feed') return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayCount < filteredPosts.length) {
          setDisplayCount(prev => Math.min(prev + PAGE_SIZE, filteredPosts.length))
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(feedEndRef.current)
    return () => observer.disconnect()
  }, [activeTab, displayCount, filteredPosts.length])

  const handleLike = useCallback(
    (postId: string) => {
      if (likeAnimations[postId]) return
      setLikeAnimations(prev => ({ ...prev, [postId]: true }))
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)))
      setTimeout(() => {
        setLikeAnimations(prev => ({ ...prev, [postId]: false }))
      }, 600)
      fetch(`/api/community/posts/${postId}/like`, { method: 'POST' }).catch(() => {})
    },
    [likeAnimations]
  )

  const containerClasses = `min-h-screen flex flex-col font-sans transition-colors duration-500 ${
    isDarkMode ? 'bg-[#050a06] text-white' : 'bg-gray-50 text-gray-900'
  }`

  const cardBorderClasses = isDarkMode
    ? 'bg-white/5 border-white/10'
    : 'bg-white/80 border-gray-200'

  return (
    <div className={containerClasses}>
      <Header isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <main id="main-content" tabIndex={-1} className="outline-none flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6 mt-6 relative z-10">
        {/* Left Sidebar - Navigation */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`p-1 rounded-2xl shadow-2xl backdrop-blur-xl border ${cardBorderClasses}`}
          >
            <div className="p-4">
              <h2 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-6 opacity-60 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-current opacity-30" />
                THE PIT STOP
              </h2>
              <nav className="flex flex-col gap-3">
                <button
                  onClick={() => setActiveTab('tunebot')}
                  className={`group relative text-left px-5 py-4 rounded-xl font-bold transition-all overflow-hidden ${
                    activeTab === 'tunebot'
                      ? 'text-white'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {activeTab === 'tunebot' && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-0"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span
                      className={`text-xl transition-transform group-hover:scale-125 ${activeTab === 'tunebot' ? 'animate-pulse' : ''}`}
                    >
                      🤖
                    </span>
                    AI TuneBot
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`group relative text-left px-5 py-4 rounded-xl font-bold transition-all overflow-hidden ${
                    activeTab === 'feed'
                      ? 'text-white'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {activeTab === 'feed' && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-0"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-xl transition-transform group-hover:rotate-12">📸</span>
                    Community Feed
                  </span>
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Live Stats Sidebar */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`mt-6 p-5 rounded-2xl shadow-xl backdrop-blur-md border ${cardBorderClasses}`}
          >
            <h3 className="text-[10px] uppercase tracking-widest font-black mb-4 opacity-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              Live Stats
            </h3>
            <div className="space-y-4">
              {isLoadingTrends && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-white/10 rounded animate-pulse" />
                  ))}
                </div>
              )}

              {!isLoadingTrends && trendsError && (
                <div className="text-xs opacity-60">
                  Live stats unavailable: <span className="text-red-400">{trendsError}</span>
                </div>
              )}

              {!isLoadingTrends && !trendsError && communityTrends && (
                <>
                  {Array.isArray(communityTrends.trends) && communityTrends.trends.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs opacity-60 font-black uppercase tracking-widest">
                        Top Community Interactions
                      </div>

                      <div className="flex overflow-x-auto md:flex-col gap-3 pb-2 md:pb-0 scroll-smooth">
                        {communityTrends.trends.map((t: any, idx: number) => (
                          <div
                            key={t.color_id ?? idx}
                            className={`flex items-center justify-between gap-4 p-3 md:p-2 rounded-lg transition-colors shrink-0 min-w-[240px] md:min-w-0 border md:border-transparent md:bg-transparent hover:bg-white/5 ${
                              isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/50'
                            }`}
                          >
                            <span className="text-[11px] opacity-70 truncate flex items-center gap-2">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ${
                                  idx === 0
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : idx === 1
                                      ? 'bg-gray-400/20 text-gray-300'
                                      : idx === 2
                                        ? 'bg-orange-700/20 text-orange-500'
                                        : 'bg-white/10 text-white/70'
                                }`}
                              >
                                #{idx + 1}
                              </span>
                              {t.color_id ?? '—'}
                            </span>
                            <span className="text-[11px] font-mono font-bold whitespace-nowrap">
                              {typeof t.score === 'number'
                                ? t.score.toLocaleString()
                                : (t.score ?? '—')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] opacity-50 pt-2 border-t border-white/5">
                        {communityTrends.source ? `Source: ${communityTrends.source}` : 'Source: —'}
                        {communityTrends.last_updated
                          ? ` • Updated: ${new Date(communityTrends.last_updated).toLocaleString()}`
                          : ''}
                      </div>
                    </div>
                  )}

                  {(!Array.isArray(communityTrends.trends) ||
                    communityTrends.trends.length === 0) && (
                    <div className="text-xs opacity-60">No community trends found yet.</div>
                  )}
                </>
              )}

              {!isLoadingTrends && !trendsError && !communityTrends && (
                <div className="text-xs opacity-60">Live stats will appear here.</div>
              )}
            </div>
          </motion.div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 flex flex-col relative min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'tunebot' ? (
              <motion.div
                key="tunebot"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className={`w-full h-[600px] md:h-[800px] rounded-3xl shadow-2xl border flex flex-col overflow-hidden backdrop-blur-xl ${
                  isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'
                }`}
              >
                {/* Chat Header */}
                <div
                  className={`p-6 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div>
                    <h1 className="text-2xl font-black flex items-center gap-3 italic tracking-tighter">
                      <span className="text-blue-500 not-italic">⚡</span> TUNEBOT{' '}
                      <span className="text-blue-500 not-italic">AI</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1 font-bold">
                      Professional Racing Intelligence
                    </p>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div
                  className={`px-6 py-3 border-b flex gap-2 overflow-x-auto scrollbar-hide ${
                    isDarkMode ? 'border-white/5' : 'border-gray-100'
                  }`}
                >
                  {['Understeer fix', 'Drift build', 'Best gearing', 'Color match'].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => {
                        sendMessage({
                          id: Date.now().toString(),
                          role: 'user',
                          parts: [{ type: 'text', text: prompt }],
                        } as import('@ai-sdk/react').UIMessage);
                      }}
                      className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-4 py-2 rounded-full border transition-all hover:bg-blue-500/10 hover:border-blue-500/30 ${
                        isDarkMode
                          ? 'border-white/10 text-gray-400 hover:text-blue-400'
                          : 'border-gray-200 text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {messages.map(m => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={m.id}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] relative group ${m.role === 'user' ? 'text-right' : 'text-left'}`}
                      >
                        <div
                          className={`inline-block px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 ${
                            m.role === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none hover:shadow-blue-500/20'
                              : isDarkMode
                                ? 'bg-white/10 text-gray-100 rounded-tl-none border border-white/10 hover:bg-white/15'
                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 hover:shadow-xl'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                            {m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')}
                          </div>
                        </div>
                        <div className="text-[9px] mt-2 opacity-30 font-bold uppercase tracking-tighter">
                          {m.role === 'assistant' ? 'TuneBot Engineer' : 'Driver'} •{' '}
                          {new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div
                        className={`px-6 py-4 rounded-3xl rounded-tl-none ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-100'}`}
                      >
                        <div className="flex gap-1.5 items-center">
                          <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div
                  className={`p-6 border-t ${
                    isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <form onSubmit={handleSubmit} className="relative">
                    <input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask for tuning advice..."
                      className={`w-full rounded-2xl pl-4 sm:pl-6 pr-[90px] sm:pr-[120px] py-4 sm:py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm sm:text-base ${
                        isDarkMode
                          ? 'bg-black/60 border border-white/10 text-white placeholder-gray-600'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-50 hover:to-indigo-500 text-white rounded-xl px-4 sm:px-8 font-black italic tracking-tighter text-xs sm:text-sm transition-all shadow-xl shadow-blue-600/30 disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      SEND{' '}
                      <span className="not-italic group-hover:translate-x-1 inline-block transition-transform">
                        →
                      </span>
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex-1 flex flex-col gap-6"
              >
                {/* Feed Controls - Enhanced */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black italic tracking-tighter">
                      COMMUNITY <span className="text-blue-500">SHOWCASE</span>
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1 font-bold">
                      {filteredPosts.length} builds shared
                    </p>
                  </div>
                  <button
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-2.5 text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <span className="text-lg leading-none">+</span> NEW POST
                  </button>
                </div>

                {/* Search & Sort Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-40">
                      🔍
                    </span>
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search builds, cars, or tuners..."
                      className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                        isDarkMode
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('latest')}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        sortBy === 'latest'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : isDarkMode
                            ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        sortBy === 'popular'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : isDarkMode
                            ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
                      }`}
                    >
                      🔥 Popular
                    </button>
                  </div>
                </div>

                {/* Trending Tags */}
                <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-4 py-2 rounded-full border transition-all ${
                      !selectedTag
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : isDarkMode
                          ? 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                          : 'border-gray-200 text-gray-600 hover:text-black hover:border-gray-400'
                    }`}
                  >
                    All
                  </button>
                  {SUGGESTED_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-4 py-2 rounded-full border transition-all ${
                        selectedTag === tag
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isDarkMode
                            ? 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                            : 'border-gray-200 text-gray-600 hover:text-black hover:border-gray-400'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                  {isLoadingPosts && posts.length === 0 ? (
                    // Skeleton loading
                    [1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`rounded-3xl border overflow-hidden ${
                          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="aspect-video bg-gray-700/20 animate-pulse" />
                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700/20 animate-pulse" />
                            <div className="space-y-2 flex-1">
                              <div className="h-3 w-24 bg-gray-700/20 rounded animate-pulse" />
                              <div className="h-2 w-16 bg-gray-700/10 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="h-4 w-full bg-gray-700/20 rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-gray-700/20 rounded animate-pulse" />
                        </div>
                      </div>
                    ))
                  ) : visiblePosts.length > 0 ? (
                    visiblePosts.map((post, idx) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`group rounded-3xl overflow-hidden border shadow-2xl transition-all hover:-translate-y-2 ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10 hover:border-blue-500/50'
                            : 'bg-white border-gray-100 hover:border-blue-500'
                        }`}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <LazyImage
                            src={post.image_url}
                            alt={post.caption}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            wrapperClassName="w-full h-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <div className="text-white">
                              <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                Share Code
                              </div>
                              <div className="text-lg font-mono font-bold tracking-wider break-all">
                                {post.tune_code || '--- --- ---'}
                              </div>
                              <button
                                onClick={() =>
                                  post.tune_code && navigator.clipboard.writeText(post.tune_code)
                                }
                                className="mt-2 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                              >
                                📋 Copy Code
                              </button>
                            </div>
                          </div>
                          {/* Car badge on image */}
                          {post.car_name && (
                            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-bold uppercase tracking-wider text-white border border-white/10">
                              {post.car_name}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                              {post.username[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-black italic tracking-tight">
                                {post.username}
                              </div>
                              <div className="text-[8px] opacity-50 uppercase font-bold">
                                {new Date(post.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm opacity-80 leading-relaxed mb-4 line-clamp-2 font-medium">
                            {post.caption}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <button
                              onClick={() => handleLike(post.id)}
                              className="flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 transition-all group/like"
                            >
                              <span
                                className={`text-lg transition-all duration-300 ${
                                  likeAnimations[post.id]
                                    ? 'scale-150 text-red-500'
                                    : 'scale-100 group-hover/like:scale-125'
                                }`}
                              >
                                {likeAnimations[post.id] ? '❤️' : '🤍'}
                              </span>
                              <span className={likeAnimations[post.id] ? 'text-red-400' : ''}>
                                {post.likes}
                              </span>
                            </button>
                            {post.tune_code && (
                              <div className="text-[10px] font-mono font-bold opacity-40 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                {post.tune_code}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Empty state
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
                      <span className="text-5xl mb-4">📭</span>
                      <h3 className="text-lg font-black italic tracking-tighter mb-2">
                        No builds found
                      </h3>
                      <p className="text-xs opacity-50 max-w-xs text-center">
                        {searchQuery || selectedTag
                          ? 'Try adjusting your search or filters.'
                          : 'Be the first to share your build with the community!'}
                      </p>
                      {(searchQuery || selectedTag) && (
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setSelectedTag(null)
                          }}
                          className="mt-4 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          Clear filters →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Infinite scroll sentinel */}
                  {displayCount < filteredPosts.length && (
                    <div ref={feedEndRef} className="col-span-full flex justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <Footer isDarkMode={isDarkMode} />

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostSuccess={() => {
          setActiveTab('feed')
          fetchPosts()
          fetchCommunityTrends()
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
