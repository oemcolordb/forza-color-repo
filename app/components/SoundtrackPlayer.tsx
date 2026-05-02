"use client";
import React, { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';

// Declare YouTube Iframe API types loosely
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface SoundtrackPlayerProps {
  isDarkMode?: boolean;
  variant?: 'floating' | 'horizontal-bar';
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const SoundtrackPlayer: React.FC<SoundtrackPlayerProps> = ({
  isDarkMode: _isDarkMode,
  variant = 'floating',
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showControls, setShowControls] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Load the YouTube IFrame Player API code asynchronously.
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // 2. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    function initPlayer() {
      playerRef.current = new window.YT.Player('youtube-background-player', {
        videoId: 'WSXdH5SzNBs',
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: 'WSXdH5SzNBs', // Required for loop
          start: 681,
          mute: 1,                 // MUST start muted for browser autoplay policies
          controls: 0,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            setIsReady(true);
            // YouTube's API requires you to explicitly call mute to satisfy some browsers
            playerRef.current.mute();
            playerRef.current.playVideo();
          },
          onStateChange: (event: any) => {
            // event.data: 1 = playing, 2 = paused
            if (event.data === 1) {
              setIsPlaying(true);
              onPlayStateChange?.(true);
            }
            if (event.data === 2) {
              setIsPlaying(false);
              onPlayStateChange?.(false);
            }
          }
        }
      });
    }
  }, []);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      playerRef.current.playVideo();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (playerRef.current && isReady) {
      if (newVol === 0) {
         playerRef.current.mute();
      } else {
         playerRef.current.unMute();
         playerRef.current.setVolume(newVol);
      }
    }
  };

  // Horizontal bar variant layout
  if (variant === 'horizontal-bar') {
    return (
      <div className="w-full mb-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-pink-500/30 shadow-lg">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 ${
                isPlaying ? 'animate-pulse bg-pink-500/20' : ''
              }`}
              aria-label={isPlaying ? "Pause Soundtrack" : "Play Soundtrack"}
              title={isPlaying ? "Pause Cyberpunk Audio" : "Play Cyberpunk Audio"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-pink-300 truncate">
                {isPlaying ? '▶ Now Playing' : '⏸ Paused'}
              </p>
              <p className="text-xs text-pink-400/70 truncate">
                Cyberpunk Soundtrack
              </p>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586l3.707 3.707A1 1 0 0015 19V5a1 1 0 00-1.707-.707L9.586 8H7a2 2 0 00-2 2z" />
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 bg-pink-900/50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                title="Volume"
              />
            </div>

            {/* YouTube Link */}
            <a
              href="https://www.youtube.com/watch?v=WSXdH5SzNBs&t=681s"
              target="_blank"
              rel="noopener noreferrer"
              title="Watch on YouTube"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600/80 text-white hover:bg-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>
          </div>
        </div>
    );
  }

  // Floating variant (default)
  return (
    <>
      <div
        className="fixed top-0 left-0 w-full h-full -z-[100] overflow-hidden bg-black pointer-events-none transition-opacity duration-700"
        style={{ opacity: isPlaying ? 1 : 0 }}
      >
        <div
          id="youtube-background-player"
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen"
        />
      </div>

      <div
        className="fixed top-20 left-4 z-50 flex flex-col gap-2 items-center"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <Button
          onClick={togglePlay}
          variant="ghost"
          size="md"
          className={`rounded-full shadow-lg border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 ${
            isPlaying ? 'animate-pulse' : ''
          } ${showControls ? 'bg-pink-900/40 text-white' : ''}`}
          aria-label="Toggle Soundtrack Audio"
          title={isPlaying ? "Pause Cyberpunk Audio" : "Play Cyberpunk Audio"}
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </Button>

        <div className={`flex flex-col gap-3 py-4 px-3 rounded-full bg-black/60 shadow-lg border border-pink-500/50 backdrop-blur-md transition-all duration-300 origin-top ${showControls ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
           <div className="flex flex-col items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586l3.707 3.707A1 1 0 0015 19V5a1 1 0 00-1.707-.707L9.586 8H7a2 2 0 00-2 2z" />
             </svg>
             <input
               type="range"
               min="0"
               max="100"
               value={volume}
               onChange={handleVolumeChange}
               className="w-24 h-1 bg-pink-900 rounded-lg appearance-none cursor-pointer accent-pink-500 origin-center -rotate-90 my-10"
               title="Volume"
             />
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
             </svg>
           </div>

           <a
             href="https://www.youtube.com/watch?v=WSXdH5SzNBs&t=681s"
             target="_blank"
             rel="noopener noreferrer"
             title="Watch on YouTube"
             className="mt-2 text-pink-400 hover:text-pink-300 transition-colors"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
               <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
             </svg>
           </a>
        </div>
      </div>
    </>
  );
};

export default SoundtrackPlayer;
