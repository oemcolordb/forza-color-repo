'use client'

import { useEffect } from 'react'

const CriticalCSS = () => {
  useEffect(() => {
    // Inline critical CSS for instant rendering
    const criticalStyles = `
      .critical-loading {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .critical-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(59, 130, 246, 0.3);
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    
    const styleSheet = document.createElement('style')
    styleSheet.textContent = criticalStyles
    document.head.appendChild(styleSheet)
    
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return null
}

export default CriticalCSS