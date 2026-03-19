'use client';

import React, { useState } from 'react';
import { exportAsJSON, exportAsCSV, exportAsText, exportAsHTML, EXPORT_FORMATS, ExportFormat } from '../lib/exportColors';

interface ExportButtonProps {
  colors: any[];
  filename?: string;
  buttonText?: string;
  className?: string;
  isDarkMode?: boolean;
}

export default function ExportButton({
  colors,
  filename = 'forza-colors',
  buttonText = '📥 Export',
  className = '',
  isDarkMode = true
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    setShowMenu(false);

    try {
      const handler = EXPORT_FORMATS[format].handler;
      const ext = EXPORT_FORMATS[format].extension;
      handler(colors, `${filename}${ext}`);
      
      // Show success message
      console.log(`Exported ${colors.length} colors as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {exporting ? '⏳ Exporting...' : buttonText}
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div
            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="py-1">
              <div className={`px-4 py-2 text-xs font-semibold ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Export {colors.length} colors as:
              </div>

              {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
                <button
                  key={key}
                  onClick={() => handleExport(key as ExportFormat)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    isDarkMode
                      ? 'text-white hover:bg-slate-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {format.label}
                  <span className={`ml-2 text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {format.extension}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
