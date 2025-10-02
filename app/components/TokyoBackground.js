import React, { useEffect, useState } from 'react'

const TokyoBackground = ({ isDarkMode, getSecureAssetUrl }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [backgroundMedia, setBackgroundMedia] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    if (!isMobile) {
      const mediaFiles = [
        { file: 'tokyo-panorama.jpg', type: 'image' },
        { file: 'neon-shibuya-crossing-tokyo-japan-1140x760.jpg', type: 'image' },
        { file: 'manuel-velasquez-ssfp9okorys-unsplash-1200x801.jpg', type: 'image' },
        { file: '3060_04.jpg', type: 'image' },
        { file: '3060_06.jpg', type: 'image' },
        { file: 'Mp 4 H 280 3 Q Nlf 3 J O Aem 8 Kv Cu Uuya AN Cr O Du C Qs 63 S Vq Z Rad 6 O 11 BZ.mp4', type: 'video' },
        { file: 'Mp 4 H 280 C Baj X 2 Z 9 R 9 E Fr 1 Gh W Ai RTFM 6 Xbt BSZ 76 N 6 Ywb BAE Dic 4 R.mp4', type: 'video' },
        { file: 'Mp 4 H 280 J 9 IY 9 U GBZ Mp Lle M Zd 6 S Zybj Yh 3 F 6 G VI 46 Cr Uf 0 PN 3 Dq TU.mp4', type: 'video' },
        { file: 'Mp 4 H 280 Szq 5 E KT 7 Ee 1 C A Vh 3 C KR Vdnf L 9 S 52 V 6 GG 2 R Md Ll V 2 Qx Y Cc.mp4', type: 'video' },
        { file: 'Mp 4 H 280 U Rk Qu 5 Hjg Vq B 14 A V 582 Kiio P 3 Db Lnqmo L 5 Z WZBEM Az 5 Z 5.mp4', type: 'video' },
        { file: 'Mp 4 H 280 Uw 0 WJIUIA Uq 31 Fa H Pqs T Zh Kewnh 32 BCLPE Fhxml I 4 ZV 5 Q.mp4', type: 'video' },
        { file: 'Mp 4 H 280 Yq 68 Y FSH 7 L G 3 Xq O 4 Vv IA 6 F Ud IEJIB 01 Qeq N 1 T Sur DR 5 T I.mp4', type: 'video' }
      ]
      
      const now = new Date()
      const thirtyMinuteSlots = Math.floor(now.getTime() / (30 * 60 * 1000))
      const mediaIndex = thirtyMinuteSlots % mediaFiles.length
      const selectedMedia = mediaFiles[mediaIndex]
      
      const mediaSrc = getSecureAssetUrl ? getSecureAssetUrl(selectedMedia.file) : `/${selectedMedia.file}`
      
      console.log('Loading Tokyo background:', mediaSrc, 'Type:', selectedMedia.type, 'Index:', mediaIndex)
      
      if (selectedMedia.type === 'image') {
        const img = new Image()
        img.onload = () => {
          console.log('Tokyo background image loaded successfully')
          setBackgroundMedia(mediaSrc)
          setMediaType('image')
          setMediaLoaded(true)
          setMediaError(false)
        }
        img.onerror = () => {
          console.warn('Failed to load Tokyo background image, using gradient fallback')
          setMediaError(true)
          setMediaLoaded(true)
        }
        img.src = mediaSrc
      } else {
        console.log('Tokyo background video set')
        setBackgroundMedia(mediaSrc)
        setMediaType('video')
        setMediaLoaded(true)
        setMediaError(false)
      }
    } else {
      setMediaLoaded(true)
    }
  }, [isMobile, getSecureAssetUrl])
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {!isMobile && mediaLoaded && backgroundMedia && !mediaError && (
        mediaType === 'image' ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${backgroundMedia})`,
              opacity: isDarkMode ? 0.4 : 0.6,
              filter: isDarkMode ? 'brightness(0.8) contrast(1.3)' : 'brightness(1.2) contrast(1.1)'
            }}
          />
        ) : (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadStart={() => console.log('Video loading started')}
            onCanPlay={() => console.log('Video can play')}
            onError={(e) => {
              console.error('Video error:', e)
              setMediaError(true)
            }}
            style={{
              opacity: isDarkMode ? 0.4 : 0.6,
              filter: isDarkMode ? 'brightness(0.8) contrast(1.3)' : 'brightness(1.2) contrast(1.1)'
            }}
          >
            <source src={backgroundMedia} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )
      )}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900/70 via-blue-900/40 to-black/80' 
          : 'bg-gradient-to-br from-blue-100/60 via-purple-100/30 to-gray-200/70'
      }`} />
      
      {!isMobile && (
        <div className="absolute inset-0">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full opacity-30 animate-pulse ${
                isDarkMode ? 'bg-cyan-400' : 'bg-blue-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TokyoBackground