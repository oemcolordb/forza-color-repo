'use client'

import dynamic from 'next/dynamic'

const NotFoundClient = dynamic(() => import('@/components/error/NotFoundClient'), { ssr: false })

export default function NotFoundWrapper() {
  return <NotFoundClient />
}
