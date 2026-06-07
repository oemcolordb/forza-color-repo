'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostSuccess: () => void
  isDarkMode: boolean
}

export default function PostModal({ isOpen, onClose, onPostSuccess, isDarkMode }: PostModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [carName, setCarName] = useState('')
  const [tuneCode, setTuneCode] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Upload to Vercel Blob
      const response = await fetch(`/api/community/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      })

      let blob: any = null
      try {
        blob = await response.json()
      } catch {
        const rawText = await response.text().catch(() => '')
        blob = { rawText }
      }

      if (!response.ok) {
        const payload = blob?.error
          ? String(blob.error)
          : blob?.rawText
            ? String(blob.rawText)
            : JSON.stringify(blob)
        console.error('Community upload failed:', {
          status: response.status,
          payload,
          blob,
        })
        throw new Error(`Upload failed (HTTP ${response.status}): ${payload}`)
      }

      const imageUrl = blob?.url ?? blob?.publicUrl ?? blob?.pathname ?? blob?.key ?? ''

      // Extra debug so we can diagnose localhost vs prod URL behavior
      console.log('Community upload response:', {
        uploadResponseFields: Object.keys(blob || {}),
        blob,
        derivedImageUrl: imageUrl,
      })

      if (!imageUrl) {
        console.error('Upload response did not include usable url fields:', { blob })
        throw new Error('Upload response did not include a usable public URL')
      }

      // 2. Save to Database
      await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Guest Driver', // In a real app, this would be from Auth
          image_url: imageUrl,
          caption,
          car_name: carName,
          tune_code: tuneCode,
        }),
      })

      onPostSuccess()
      onClose()
      // Reset form
      setFile(null)
      setPreview(null)
      setCaption('')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border ${
              isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}
            >
              <h2 className="text-xl font-black italic tracking-tighter uppercase">
                Share Your <span className="text-blue-500">Build</span>
              </h2>
              <button
                onClick={onClose}
                className="text-2xl opacity-50 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* Image Upload Area */}
              <div
                className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-colors ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-4xl mb-2">📸</span>
                    <span className="text-xs font-bold opacity-50">CLICK TO UPLOAD SCREENSHOT</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    Car Model
                  </label>
                  <input
                    value={carName}
                    onChange={e => setCarName(e.target.value)}
                    placeholder="e.g. Nissan R34"
                    className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    Share Code
                  </label>
                  <input
                    value={tuneCode}
                    onChange={e => setTuneCode(e.target.value)}
                    placeholder="123 456 789"
                    className={`w-full px-4 py-3 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Tell us about this build..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none ${
                    isDarkMode
                      ? 'bg-white/5 border border-white/10 text-white'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black italic tracking-tighter shadow-xl shadow-blue-600/20 disabled:opacity-30 transition-all"
              >
                {isUploading ? 'UPLOADING...' : 'POST TO PIT STOP →'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
