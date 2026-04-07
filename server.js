/**
 * Forza Horizon 5 Telemetry Bridge Server
 *
 * This server bridges UDP telemetry data from Forza Horizon 5 to WebSocket clients.
 * It enables real-time dashboard displays and data forwarding to multiple endpoints.
 *
 * @module server
 * @requires ./services/telemetryBridge.js
 * @requires ./scripts/fix-microsoft-store.js
 */

import TelemetryBridge from './services/telemetryBridge.js'
import MicrosoftStoreFix from './scripts/fix-microsoft-store.js'

/**
 * Initialize telemetry bridge
 * @param {number} udpPort - Port to receive Forza UDP telemetry (default: 9999)
 * @param {number} wsPort - WebSocket port for client connections (default: 8080)
 */
const bridge = new TelemetryBridge(5300, 8080)

/**
 * Add UDP forwarders for multiple applications
 * Uncomment and configure for additional endpoints:
 *
 * @example
 * bridge.addForwarder('192.168.1.100', 9998) // Motion rig
 * bridge.addForwarder('192.168.1.101', 9997) // Secondary dashboard
 */
// bridge.addForwarder('192.168.1.100', 9998)
// bridge.addForwarder('192.168.1.101', 9997)

console.log('Starting Forza Horizon 5 Telemetry Bridge...')
console.log('UDP Port: 5300 (matches Forza Data Out IP Port setting)')
console.log('WebSocket Port: 8080 (for web dashboards)')
console.log('Mobile Dashboard: http://localhost:3000/mobile-dash')

/**
 * Start the telemetry bridge server
 * Runs diagnostics before starting to ensure proper configuration
 */
MicrosoftStoreFix.runDiagnostics().then(() => {
  bridge.start()
})

/**
 * Graceful shutdown handler
 * Stops the telemetry bridge and closes all connections
 */
process.on('SIGINT', () => {
  console.log('\nShutting down telemetry bridge...')
  bridge.stop()
  process.exit(0)
})
