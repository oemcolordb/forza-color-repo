import TelemetryDashboard from '../components/TelemetryDashboard'

export default function TelemetryPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Forza Horizon 5 Telemetry
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Setup Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>In Forza Horizon 5, go to Settings → HUD and Gameplay</li>
            <li>Set "Data Out" to "On"</li>
            <li>Set "Data Out IP Address" to "127.0.0.1"</li>
            <li>Set "Data Out IP Port" to "9999"</li>
            <li>Set "Data Out Packet Format" to "Dash"</li>
          </ol>
        </div>

        <TelemetryDashboard />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Forza Telemetry Dashboard',
  description: 'Real-time telemetry data from Forza Horizon 5'
}