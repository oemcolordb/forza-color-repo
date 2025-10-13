'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs'

export default function Blog() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme !== 'light')
  }, [])

  const blogPosts = [
    {
      title: "2024 Popular Car Colors: Trends and Analysis",
      excerpt: "Discover the most popular automotive paint colors of 2024 based on Forza data analysis.",
      slug: "2024-popular-car-colors",
      date: "2024-01-15",
      category: "Trends"
    },
    {
      title: "How to Choose the Perfect Car Paint Color",
      excerpt: "Complete guide to selecting automotive colors that match your style and maintain resale value.",
      slug: "how-to-choose-car-paint-color", 
      date: "2024-01-10",
      category: "Guide"
    },
    {
      title: "The History of Ferrari Red: Rosso Corsa",
      excerpt: "Exploring the iconic Ferrari red color and its evolution through automotive history.",
      slug: "ferrari-red-history",
      date: "2024-01-05", 
      category: "History"
    }
  ]

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      <Breadcrumbs isDarkMode={isDarkMode} />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">🚗 Automotive Color Blog</h1>
        
        <div className="grid gap-6">
          {blogPosts && Array.isArray(blogPosts) ? blogPosts.map((post) => (
            <article key={post.slug} className={`rounded-xl p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">{post.category}</span>
                <span className="text-sm text-gray-500">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
              <p className="mb-4 text-gray-600">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">Read More →</Link>
            </article>
          )) : null}
        </div>
      </div>
    </div>
  )
}