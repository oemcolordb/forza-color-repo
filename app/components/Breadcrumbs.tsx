'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbsProps {
  isDarkMode: boolean
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ isDarkMode }) => {
  const pathname = usePathname()

  if (!pathname) return null

  const pathSegments = pathname.split('/').filter(segment => segment !== '')

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/')
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      return { name, href }
    }),
  ]

  if (breadcrumbs.length <= 1) return null

  return (
    <nav
      className={`px-4 py-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-1">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <span className={`mx-2 ${isDarkMode ? 'text-[color:var(--bamboo-bark)]' : 'text-gray-400'}`}>
                /
              </span>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className={`font-semibold ${isDarkMode ? 'text-[color:var(--bamboo-paper)]' : 'text-gray-900'}`}>
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={`rounded px-1 py-0.5 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bamboo-stalk)] ${
                  isDarkMode
                    ? 'text-[color:var(--bamboo-stalk)] hover:text-[color:var(--bamboo-stalk-2)]'
                    : 'text-[color:var(--bamboo-moss)] hover:text-[color:var(--bamboo-stalk-2)]'
                }`}
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
