'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FavoriteColor {
  colorId: string;
  colorName: string;
  make: string;
  model?: string;
  colorType?: string;
  color1: { h: number; s: number; b: number };
  color2?: { h: number; s: number; b: number };
}

interface CreatePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteColor[];
  sessionId: string;
  onSuccess: () => void;
}

const COMMON_TAGS = ['JDM', 'Racing', 'Drift', 'Street', 'Offroad', 'Cyberpunk', 'Classic', 'Neon', 'Matte', 'Luxury'];

export default function CreatePaletteModal({ isOpen, onClose, favorites, sessionId, onSuccess }: CreatePaletteModalProps) {
  const [selectedColors, setSelectedColors] = useState<FavoriteColor[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleColor = (color: FavoriteColor) => {
    if (selectedColors.find(c => c.colorId === color.colorId)) {
      setSelectedColors(selectedColors.filter(c => c.colorId !== color.colorId));
    } else {
      if (selectedColors.length >= 5) {
        setError('You can only select up to 5 colors for a palette.');
        return;
      }
      setSelectedColors([...selectedColors, color]);
      setError('');
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      if (tags.length >= 3) {
        setError('Maximum 3 tags allowed.');
        return;
      }
      setTags([...tags, tag]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColors.length < 2) {
      setError('Please select at least 2 colors.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide a name for your palette.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          tags,
          colors: selectedColors,
          authorId: sessionId
        }),
      });

      if (!res.ok) throw new Error('Failed to create palette');
      
      onSuccess();
      onClose();
      // Reset form
      setSelectedColors([]);
      setName('');
      setDescription('');
      setTags([]);
    } catch (err) {
      setError('Failed to publish palette. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Palette</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Color Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Select Colors ({selectedColors.length}/5) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-h-48 overflow-y-auto p-1">
              {favorites.map(color => {
                const isSelected = selectedColors.some(c => c.colorId === color.colorId);
                const h1 = color.color1.h * 360, s1 = color.color1.s * 100, b1 = color.color1.b * 100;
                const h2 = (color.color2?.h ?? color.color1.h) * 360, s2 = (color.color2?.s ?? color.color1.s) * 100, b2 = (color.color2?.b ?? color.color1.b) * 100;
                
                return (
                  <button
                    key={color.colorId}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`relative flex h-20 w-full cursor-pointer flex-col overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-105'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 z-0" 
                      style={{ background: `linear-gradient(135deg, hsl(${h1}, ${s1}%, ${b1}%), hsl(${h2}, ${s2}%, ${b2}%))` }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-left">
                      <span className="block truncate text-[10px] font-medium text-white">{color.colorName}</span>
                    </div>
                  </button>
                );
              })}
              {favorites.length === 0 && (
                <div className="col-span-full py-4 text-center text-sm text-gray-500">
                  You don't have any favorites yet! Save some colors first.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Palette Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Midnight Runner, Porsche Classic..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the inspiration behind this?"
                rows={2}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Tags ({tags.length}/3)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedColors.length < 2 || !name.trim()}
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Publishing...</span>
                </>
              ) : (
                'Publish Palette'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
