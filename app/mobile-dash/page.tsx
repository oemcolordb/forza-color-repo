import MobileTelemetryDash from '../components/MobileTelemetryDash'

export default function MobileDashPage() {
  return <MobileTelemetryDash />
}

export const metadata = {
  title: 'Mobile Telemetry Dashboard',
  description: 'Mobile-optimized Forza Horizon 5 telemetry dashboard'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}