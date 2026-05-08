"use client";

import React, { useState } from 'react';
import { logger } from '../lib/logger';
// Lightweight: avoid adding new runtime deps. Use inline glyphs instead of external icon libs / motion.

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

interface ScenicSpot {
  name: string;
  description: string;
  url: string;
}

export function ScenicFinder() {
  const [query] = useState('Forza Horizon 5');
  const [isSearching, setIsSearching] = useState(false);
  const [spots, setSpots] = useState<ScenicSpot[]>([]);
  const [showMap, setShowMap] = useState(true);

  // Direct external URL — used for the "Full Screen" link so users can open
  // the map on swissgameguides.app directly.
  const mainMapUrl = "https://swissgameguides.app/maps/forza_horizon_5/mexico";

  // Same-origin proxy URL — routes through our server-side SOCKS5 proxy so
  // the iframe loads cleanly regardless of the upstream site's X-Frame-Options
  // or our CSP's frame-src restrictions.
  const proxyMapUrl = "/api/map-proxy";

  const findSpots = async () => {
    setIsSearching(true);
    setSpots([]);
    setShowMap(false);

    try {
      // Gemini client is not bundled — always use fallback curated links
      const aiClient: any = null;

      if (!aiClient) {
        setSpots([
          { name: 'SwissGameGuides FH5 Map', description: 'Interactive FH5 map', url: mainMapUrl },
          { name: 'IGN FH5 Map', description: 'IGN interactive map', url: 'https://www.ign.com/maps/forza-horizon-5/mexico' },
          { name: 'Guides4Gamers FH5 Map', description: 'Guides4Gamers FH5 map', url: 'https://guides4gamers.com/forza-horizon-5/maps/mexico/' },
        ]);
        return;
      }

      const prompt = `Find interactive maps and scenic location markers specifically for "Forza Horizon 5". 
           Look for MapGenie maps, community-marked photography spots, drift zones, and hidden beauty spots.
           Provide a list of the best interactive map links or community guides for FH5.`;

      // Attempt to use the client to generate content; shapes may vary by SDK version.
      const response = await aiClient.models?.generateContent
        ? await aiClient.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
          })
        : await aiClient.generate?.({ prompt });

      const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const searchLinks = chunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web?.title || "View Source",
          url: c.web?.uri || "",
          description: "Forza Horizon 5 Map / Guide",
        }));

      if (searchLinks.length > 0) {
        setSpots(searchLinks.map((link: any) => ({ name: link.title, description: link.description, url: link.url })));
      } else {
        // fallback if AI didn't return useful links
        setSpots([
          { name: 'SwissGameGuides FH5 Map', description: 'Interactive FH5 map', url: mainMapUrl },
          { name: 'IGN FH5 Map', description: 'IGN interactive map', url: 'https://www.ign.com/maps/forza-horizon-5/mexico' },
          { name: 'Guides4Gamers FH5 Map', description: 'Guides4Gamers FH5 map', url: 'https://guides4gamers.com/forza-horizon-5/maps/mexico/' },
        ]);
      }
    } catch (error) {
      logger.error("Search failed:", error);
      setSpots([{ name: 'SwissGameGuides FH5 Map', description: 'Interactive FH5 map', url: mainMapUrl }]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={cn(
      "transition-all duration-500",
      showMap ? "space-y-0" : "space-y-6 p-4 md:p-8"
    )}>
      {!showMap && (
        <div className="flex flex-col items-center text-center space-y-4 px-4">
            <div className="p-4 rounded-full bg-orange-500/10 text-orange-500">
            <span className="text-2xl">🎮</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">FH5 Location Finder</h2>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Interactive Mexico Map & Guides</p>
          </div>
        </div>
      )}

      {!showMap && (
        <div className="flex gap-2 max-w-md mx-auto px-4">
          <button
            onClick={() => setShowMap(true)}
            className={cn(
              "flex-1 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all",
              showMap ? "bg-orange-500 text-white font-bold" : "bg-white/5 text-zinc-500 hover:text-zinc-300"
            )}
          >
            Interactive Map
          </button>
          <button
            onClick={() => setShowMap(false)}
            className={cn(
              "flex-1 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all",
              !showMap ? "bg-orange-500 text-white font-bold" : "bg-white/5 text-zinc-500 hover:text-zinc-300"
            )}
          >
            AI Search
          </button>
        </div>
      )}

      {showMap ? (
        <div className="relative h-screen w-full overflow-hidden bg-black">
          <iframe 
            src={proxyMapUrl}
            className="w-full h-full border-0"
            title="FH5 Interactive Map"
            allow="fullscreen"
          />

          <div className="absolute top-20 left-4 flex flex-col gap-2 z-20">
            <div className="flex gap-1 p-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/10">
              <button
                onClick={() => setShowMap(true)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all",
                  showMap ? "bg-orange-500 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Map
              </button>
              <button
                onClick={() => setShowMap(false)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all",
                  !showMap ? "bg-orange-500 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                AI Search
              </button>
            </div>
          </div>

          <div className="absolute top-20 right-4 z-20">
            <a 
              href={mainMapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-orange-500 transition-all flex items-center gap-2 text-xs font-mono uppercase border border-white/10"
            >
              <span className="text-xs">🔗</span> Full Screen
            </a>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
            <div className="p-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl text-center">
              <p className="text-[10px] text-orange-200 font-mono leading-relaxed">
                <span className="font-bold text-orange-500 uppercase">Pro Tip:</span> Use the interactive map to filter for XP boards, Barn Finds, and scenic photo markers.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={findSpots}
            disabled={isSearching}
            className="w-full group relative overflow-hidden bg-white text-black font-black py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors">
              {isSearching ? (
                <span className="animate-spin inline-block">⟳</span>
              ) : (
                <>
                  <span className="text-base">🧭</span>
                  FIND MORE FH5 SPOTS
                </>
              )}
            </span>
          </button>

          <div className="space-y-4">
              {spots.length === 0 && !isSearching ? (
                <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-zinc-600 gap-2">
                  <span className="text-xl">📷</span>
                  <p className="text-xs font-mono uppercase tracking-widest">Tap to find markers</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {spots.map((spot, i) => (
                    <a
                      key={i}
                      href={spot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <span className="text-sm">🗺️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors truncate">{spot.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter truncate">{spot.description}</p>
                        </div>
                      </div>
                      <span className="text-zinc-600 group-hover:text-white transition-colors shrink-0">🔗</span>
                    </a>
                  ))}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}

export default ScenicFinder;
