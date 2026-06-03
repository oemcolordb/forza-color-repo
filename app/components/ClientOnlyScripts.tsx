'use client'

import dynamic from 'next/dynamic'

const ThirdPartyErrorBoundary = dynamic(
  () => import('./ThirdPartyErrorBoundary').then((mod) => mod.ThirdPartyErrorBoundary),
  { ssr: false }
)

const ServiceWorkerStatus = dynamic(
  () => import('./ServiceWorkerStatus'),
  { ssr: false }
)

const EasterEgg420 = dynamic(
  () => import('./EasterEgg420'),
  { ssr: false }
)

export default function ClientOnlyScripts() {
  return (
    <>
      <ThirdPartyErrorBoundary />
      <EasterEgg420 />
      <ServiceWorkerStatus />
    </>
  )
}
