import React, { useEffect, useState } from 'react';
import type { CarColor, ColorLayer } from '../types';
import { GoogleGenAI } from '@google/genai';
import { getCachedResponse, setCachedResponse, generateCacheKey } from '../services/aiCache';

interface ColorDetailsModalProps {
  color: CarColor;
  onClose: () => void;
}

const hsbToHsl = (h: number, s: number, b: number): [number, number, number] => {
  const l = b * (1 - s / 2);
  const newS = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l);
  return [h * 360, newS * 100, l * 100];
};

const ColorLayerDetails: React.FC<{ title: string; layer: ColorLayer }> = ({ title, layer }) => (
    <div>
        <h4 className="text-lg font-semibold text-cyan-400 mb-2">{title}</h4>
        <div className="grid grid-cols-3 gap-2 text-sm bg-slate-800 p-3 rounded-md">
            <span>Hue: <span className="font-mono text-slate-300">{layer.h.toFixed(3)}</span></span>
            <span>Saturation: <span className="font-mono text-slate-300">{layer.s.toFixed(3)}</span></span>
            <span>Brightness: <span className="font-mono text-slate-300">{layer.b.toFixed(3)}</span></span>
        </div>
    </div>
);

const ColorDetailsModal: React.FC<ColorDetailsModalProps> = ({ color, onClose }) => {
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [h1, s1, l1] = hsbToHsl(color.color1.h, color.color1.s, color.color1.b);
  const [h2, s2, l2] = hsbToHsl(color.color2.h, color.color2.s, color.color2.b);
  const gradient = `linear-gradient(90deg, hsl(${h1}, ${s1}%, ${l1}%), hsl(${h2}, ${s2}%, ${l2}%))`;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      setDetails('');

      if (!process.env.API_KEY) {
        setLoading(false);
        setDetails('Gemini API key not configured. This feature is unavailable.');
        return;
      }

      try {
        // Check cache first
        const cacheKey = generateCacheKey(color.make, color.model, color.colorName, color.year);
        const cachedResponse = getCachedResponse(cacheKey);
        
        if (cachedResponse) {
          setDetails(cachedResponse);
          setLoading(false);
          return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const carInfo = `${color.make}${color.model ? ` ${color.model}` : ''}${color.year && color.year > 0 ? ` (${color.year})` : ''}`;
        const prompt = `Brief fact about "${color.colorName}" color on ${carInfo}. Max 40 words.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
        });

        const responseText = response.text || 'No details available';
        setDetails(responseText);
        
        // Cache the response
        setCachedResponse(cacheKey, responseText);
      } catch (e) {
        console.error("Gemini API Error:", e);
        setError("Could not fetch details from the Gemini API.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [color]);
  
  const modelDisplay = color.model ? ` ${color.model}` : '';
  const yearDisplay = color.year && color.year > 0 ? ` (${color.year})` : '';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="color-details-heading"
    >
      <div 
        className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-8 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="w-full h-48 rounded-lg mb-6" style={{ background: gradient }}></div>

        <h2 id="color-details-heading" className="text-3xl font-bold text-slate-100 bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text mb-2">
            {color.colorName}
        </h2>
        <p className="text-lg text-slate-400 mb-6">{color.make}{modelDisplay}{yearDisplay}</p>

        <div className="space-y-6">
            {color.colorType && (
                <p className="text-slate-300">
                    <span className="font-semibold text-slate-100">Color Type:</span> {color.colorType}
                </p>
            )}

            <ColorLayerDetails title="Color 1 (Base)" layer={color.color1} />
            <ColorLayerDetails title="Color 2 (Highlight/Flake)" layer={color.color2} />
            
            <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">About this Color</h4>
                {loading && <div className="rounded-md bg-slate-800 p-4"><div className="w-3/4 h-4 bg-slate-700 rounded animate-pulse"></div></div>}
                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                {details && <p className="text-slate-300">{details}</p>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ColorDetailsModal;