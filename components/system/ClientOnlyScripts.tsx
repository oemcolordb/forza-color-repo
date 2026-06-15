'use client'

import ClientOnly from '@/components/system/ClientOnly'
import { ThirdPartyErrorBoundary } from '@/components/error/ThirdPartyErrorBoundary'
import ServiceWorkerStatus from '@/components/system/ServiceWorkerStatus'
import EasterEgg420 from '@/components/system/EasterEgg420'

export default function ClientOnlyScripts() {
  return (
    <ClientOnly>
      <ThirdPartyErrorBoundary />
      <EasterEgg420 />
      <ServiceWorkerStatus />
    </ClientOnly>
  )
}
