"use client";

import React from 'react';
import SpeedCameraList from './SpeedCameraList';
import Breadcrumbs from '../components/Breadcrumbs';
import ScenicFinder from './ScenicFinder';
import { useMapPersistence } from '../hooks/useMapPersistence';

export default function LocationFinderPage() {
  const { progress, isLoading, lastSynced, syncError } = useMapPersistence()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/30 backdrop-blur-md border-b border-gray-700/50 shadow-lg sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back
          </a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 10l6 3"></path>
            <path d="M12 10L6 7"></path>
            <path d="M12 10v6"></path>
          </svg>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Forza Horizon 5{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Location Finder
            </span>
          </h1>
          <div className="ml-auto flex items-center gap-2 text-sm">
            {isLoading ? (
              <span className="text-yellow-400 flex items-center gap-1">
                <span className="animate-spin">⟳</span> Loading...
              </span>
            ) : syncError ? (
              <span className="text-red-400 flex items-center gap-1" title={syncError}>
                ⚠ Offline
              </span>
            ) : lastSynced ? (
              <span className="text-green-400 flex items-center gap-1" title={`Last synced: ${lastSynced.toLocaleTimeString()}`}>
                ☁ Synced
              </span>
            ) : (
              <span className="text-gray-400">Local only</span>
            )}
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">
              {progress.visitedLocations.length} visited • {progress.favoriteLocations.length} ❤
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto w-full">
        <Breadcrumbs isDarkMode={true} />
      </div>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-screen-2xl mx-auto w-full">
        <section className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col">
          <ScenicFinder />
        </section>

        {/* Speed Cameras Table */}
        <div className="mt-8 bg-gray-900/80 rounded-xl border border-blue-700/40 shadow-xl p-4 lg:col-span-2">
          <h2 className="text-lg font-bold mb-2 text-blue-300">All Speed Cameras (Live)</h2>
          <SpeedCameraList />
        </div>

        {/* Credits */}
        <div className="mt-4 bg-gray-800/60 rounded-xl border border-yellow-500/40 shadow-xl p-6 lg:col-span-2 text-center">
          <p className="text-yellow-300 text-xl font-extrabold mb-2">🙏 A Massive Thank You to the Swiss Game Guides Team!</p>
          <p className="text-white font-bold text-base mb-3">
            This location finder is powered by the incredible interactive FH5 map at{' '}
            <a
              href="https://swissgameguides.app/maps/forza_horizon_5/mexico"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 underline hover:text-yellow-200 transition-colors font-extrabold"
            >
              swissgameguides.app
            </a>
            . This resource is an <span className="font-extrabold text-yellow-300">absolute blessing</span> for the Forza Horizon 5 community.
          </p>
          <p className="text-gray-300 font-bold">
            Huge credit and gratitude to the developers and map creators at Swiss Game Guides —{' '}
            <span className="text-yellow-300 font-extrabold">you legends have made navigating Mexico so much easier for everyone.</span>{' '}
            Thank you for your time, effort, and dedication to the community. 💛
          </p>
        </div>
      </main>
    </div>
  )
}
