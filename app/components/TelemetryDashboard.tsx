'use client'

export default function TelemetryDashboard() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Telemetry Dashboard</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Connect to Forza Horizon 5 to view live telemetry data.
      </p>
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Waiting for data connection...
        </p>
      </div>
    </div>
  )
}
