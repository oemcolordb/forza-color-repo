"use client";
import React, { useEffect, useState } from "react";
import { parseMarkdown } from "../../src/lib/parsers/fh5";
import type { FH5Location } from "../../src/types/fh5";

// Source keys — kept here so the API key in firecrawl.ts is never bundled client-side.
const SOURCES = ["IGN", "G4G"] as const;
type SourceKey = (typeof SOURCES)[number];

interface CameraResult {
  name: string;
  region: string;
  coords?: { x: number; y: number };
  source: string;
}

export default function SpeedCameraList() {
  const [cameras, setCameras] = useState<CameraResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCameras() {
      setLoading(true);
      setError(null);
      try {
        const results: CameraResult[] = [];
        for (const src of SOURCES) {
          const res = await fetch(`/api/scrape?source=${src}`)
          if (!res.ok) continue
          const { markdown: md } = await res.json() as { markdown: string | null }
          if (md) {
            const locs: FH5Location[] = parseMarkdown(md, src as SourceKey);
            locs.filter(l => l.type === "Speed Camera").forEach(l => {
              results.push({
                name: l.name,
                region: l.region,
                coords: l.coords,
                source: src,
              });
            });
          }
        }
        if (!cancelled) setCameras(results);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load speed cameras");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCameras();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div>Loading speed cameras…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!cameras.length) return <div>No speed cameras found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Region</th>
            <th className="px-3 py-2 text-left">Coords</th>
            <th className="px-3 py-2 text-left">Source</th>
          </tr>
        </thead>
        <tbody>
          {cameras.map((cam, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2">{cam.name}</td>
              <td className="px-3 py-2">{cam.region}</td>
              <td className="px-3 py-2">{cam.coords ? `[${cam.coords.x}, ${cam.coords.y}]` : "not available"}</td>
              <td className="px-3 py-2">{cam.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
