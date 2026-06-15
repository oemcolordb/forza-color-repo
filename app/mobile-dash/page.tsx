'use client'



import ClientOnly from '@/components/system/ClientOnly'
import MobileTelemetryDash from '@/components/telemetry/MobileTelemetryDash'

export default function MobileDashPage() {
  return (
    <ClientOnly>
      <MobileTelemetryDash />
    </ClientOnly>
  )
}
