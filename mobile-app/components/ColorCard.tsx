import React from 'react';
import type { CarColor } from '../types';

interface ColorCardProps {
  color: CarColor;
  onSelect: (color: CarColor) => void;
}

const hsbToHsl = (h: number, s: number, b: number): [number, number, number] => {
  const l = b * (1 - s / 2);
  const newS = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l);
  return [h * 360, newS * 100, l * 100];
};

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

const ColorCard: React.FC<ColorCardProps> = ({ color, onSelect }) => {
  const [h1, s1, l1] = hsbToHsl(color.color1.h, color.color1.s, color.color1.b);
  const [h2, s2, l2] = hsbToHsl(color.color2.h, color.color2.s, color.color2.b);

  const gradient = `linear-gradient(45deg, hsl(${h1}, ${s1}%, ${l1}%), hsl(${h2}, ${s2}%, ${l2}%))`;
  
  const modelDisplay = color.model ? ` ${color.model}` : '';
  const yearDisplay = color.year && color.year > 0 ? ` (${color.year})` : '';

  return (
    <div 
      className="rounded-lg shadow-lg bg-slate-800/80 border border-slate-700 overflow-hidden transition-shadow duration-300 group flex flex-col"
    >
      <div 
        className="h-32 w-full"
        style={{ background: gradient }}
      ></div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 truncate">{color.colorName}</h3>
          <p className="text-sm text-slate-400 truncate">{color.make}{modelDisplay}{yearDisplay}</p>
        </div>
        <div className="flex justify-between items-center mt-4 min-h-[26px]">
          {color.colorType && <span className="text-xs bg-slate-700 text-cyan-400 font-semibold px-2 py-1 rounded-full">{color.colorType}</span>}
          <button
            onClick={() => onSelect(color)}
            className="text-slate-500 hover:text-fuchsia-400 transition-colors ml-auto"
            aria-label={`Learn more about ${color.colorName}`}
          >
            <InfoIcon className="w-6 h-6"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorCard;