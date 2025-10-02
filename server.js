import TelemetryBridge from './services/telemetryBridge.js'
import MicrosoftStoreFix from './scripts/fix-microsoft-store.js'

const bridge = new TelemetryBridge(9999, 8080)

// Add UDP forwarders for multiple applications
// bridge.addForwarder('192.168.1.100', 9998) // Motion rig
// bridge.addForwarder('192.168.1.101', 9997) // Secondary dashboard

console.log('Starting Forza Horizon 5 Telemetry Bridge...')
console.log('UDP Port: 9999 (configure in Forza settings)')
console.log('WebSocket Port: 8080 (for web dashboards)')
console.log('Mobile Dashboard: http://localhost:3000/mobile-dash')

// Run diagnostics on startup
MicrosoftStoreFix.runDiagnostics().then(() => {
  bridge.start()
})

process.on('SIGINT', () => {
  console.log('\nShutting down telemetry bridge...')
  bridge.stop()
  process.exit(0)
})