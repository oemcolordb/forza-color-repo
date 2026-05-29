'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PostModal from '../components/PostModal'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Post {
  id: string;
  username: string;
  image_url: string;
  caption: string;
  car_name?: string;
  tune_code?: string;
  likes: number;
  created_at: string;
}

export default function CommunityPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState<'feed' | 'tunebot'>('tunebot')
  const [posts, setPosts] = useState<Post[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchPosts = useCallback(() => {
    fetch('/api/community/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Fetch posts error:', err))
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'Welcome to The Pit Stop! 🏁 I am TuneBot, your AI racing engineer. Need help fixing understeer, setting up a drift build, or finding the perfect color match? Let me know what you are driving!'
      }
    ]
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchPosts()
    }
  }, [activeTab, fetchPosts])

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#050a06] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6 mt-6 relative z-10">

        {/* Left Sidebar - Navigation */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`p-1 rounded-2xl shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}
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
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {activeTab === 'tunebot' && (
                    <motion.div layoutId="nav-bg" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-0" />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span className={`text-xl transition-transform group-hover:scale-125 ${activeTab === 'tunebot' ? 'animate-pulse' : ''}`}>🤖</span>
                    AI TuneBot
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`group relative text-left px-5 py-4 rounded-xl font-bold transition-all overflow-hidden ${
                    activeTab === 'feed'
                    ? 'text-white'
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {activeTab === 'feed' && (
                    <motion.div layoutId="nav-bg" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-0" />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-xl transition-transform group-hover:rotate-12">📸</span>
                    Community Feed
                  </span>
                </button>
              </nav>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`mt-6 p-5 rounded-2xl shadow-xl backdrop-blur-md border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}
          >
             <h3 className="text-[10px] uppercase tracking-widest font-black mb-4 opacity-50 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
               Live Stats
             </h3>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-xs opacity-60">Active Tuners</span>
                 <span className="text-xs font-mono font-bold">1,248</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-xs opacity-60">AI Consultations</span>
                 <span className="text-xs font-mono font-bold">42.5k</span>
               </div>
             </div>
          </motion.div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 min-h-[600px] flex flex-col relative">
          <AnimatePresence mode="wait">
            {activeTab === 'tunebot' ? (
              <motion.div
                key="tunebot"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className={`flex-1 rounded-3xl shadow-2xl border flex flex-col overflow-hidden backdrop-blur-xl ${
                  isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'
                }`}
              >
                {/* Chat Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <div>
                    <h1 className="text-2xl font-black flex items-center gap-3 italic tracking-tighter">
                      <span className="text-blue-500 not-italic">⚡</span> TUNEBOT <span className="text-blue-500 not-italic">AI</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1 font-bold">Professional Racing Intelligence</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-gray-900' : 'border-white'} bg-gray-400 overflow-hidden`}>
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                    <div className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-gray-900' : 'border-white'} bg-blue-600 flex items-center justify-center text-[10px] font-bold`}>+99</div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {messages.map((m) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={m.id}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] relative group ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 ${
                          m.role === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none hover:shadow-blue-500/20'
                            : isDarkMode
                              ? 'bg-white/10 text-gray-100 rounded-tl-none border border-white/10 hover:bg-white/15'
                              : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 hover:shadow-xl'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{m.content}</div>
                        </div>
                        <div className="text-[9px] mt-2 opacity-30 font-bold uppercase tracking-tighter">
                          {m.role === 'assistant' ? 'TuneBot Engineer' : 'Driver'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`px-6 py-4 rounded-3xl rounded-tl-none ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-100'}`}>
                         <div className="flex gap-1.5 items-center">
                           <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className={`p-6 border-t ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <form onSubmit={handleSubmit} className="relative">
                    <input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask for tuning adjustments, color codes, or build advice..."
                      className={`w-full rounded-2xl pl-6 pr-24 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium ${
                        isDarkMode ? 'bg-black/60 border border-white/10 text-white placeholder-gray-600' : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-50 hover:to-indigo-500 text-white rounded-xl px-8 font-black italic tracking-tighter text-sm transition-all shadow-xl shadow-blue-600/30 disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      SEND <span className="not-italic group-hover:translate-x-1 inline-block transition-transform">→</span>
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
                {/* Feed Controls */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black italic tracking-tighter">COMMUNITY <span className="text-blue-500">SHOWCASE</span></h2>
                  <button
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-2.5 text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <span>+</span> NEW POST
                  </button>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                  {posts.length > 0 ? posts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`group rounded-3xl overflow-hidden border shadow-2xl transition-all hover:-translate-y-2 ${
                        isDarkMode ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'bg-white border-gray-100 hover:border-blue-500'
                      }`}
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                           <div className="text-white">
                             <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Share Code</div>
                             <div className="text-lg font-mono font-bold">{post.tune_code || '--- --- ---'}</div>
                           </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
                            {post.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-black italic tracking-tight">{post.username}</div>
                            <div className="text-[8px] opacity-50 uppercase font-bold">{new Date(post.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <p className="text-sm opacity-80 leading-relaxed mb-4 line-clamp-2 font-medium">
                          {post.caption}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                             <span className="text-red-500">♥</span> {post.likes} Likes
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-tighter text-blue-500 px-3 py-1 rounded-full bg-blue-500/10">
                             {post.car_name || 'Showcase'}
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    // Skeleton/Placeholder Posts
                    [1,2,3,4].map(i => (
                      <div key={i} className={`h-80 rounded-3xl border animate-pulse ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`} />
                    ))
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
        onPostSuccess={fetchPosts}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
