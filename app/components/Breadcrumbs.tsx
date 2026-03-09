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
    <nav className={`px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={`hover:underline ${
                  isDarkMode
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-800'
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
