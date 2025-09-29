import React from 'react'

interface BreadcrumbsProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  isDarkMode: boolean
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, isDarkMode }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://forza-colors.netlify.app'}${item.href}` : undefined
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className={`flex items-center space-x-2 text-sm ${
          isDarkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">/</span>
              )}
              {item.current ? (
                <span className={`font-medium ${
                  isDarkMode ? 'text-slate-200' : 'text-gray-900'
                }`} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className={`hover:underline ${
                    isDarkMode ? 'hover:text-slate-200' : 'hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

export default Breadcrumbs