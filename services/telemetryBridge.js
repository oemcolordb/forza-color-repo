import dgram from 'dgram'
import { WebSocketServer } from 'ws'
import ForzaTelemetryReceiver from './forzaTelemetry.js'

class TelemetryBridge {
  constructor(udpPort = 9999, wsPort = 8080) {
    this.udpPort = udpPort
    this.wsPort = wsPort
    this.forwarders = []
    this.clients = new Set()
    this.lastData = null
    
    this.receiver = new ForzaTelemetryReceiver(udpPort)
    this.wss = new WebSocketServer({ port: wsPort })
    
    this.setupWebSocket()
    this.setupTelemetry()
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws)
      
      // Send last known data immediately
      if (this.lastData) {
        ws.send(JSON.stringify(this.lastData))
      }
      
      ws.on('close', () => this.clients.delete(ws))
    })
  }

  setupTelemetry() {
    this.receiver.onData((data) => {
      this.lastData = data
      this.broadcastToClients(data)
      this.forwardUDP(data)
    })
  }

  broadcastToClients(data) {
    const message = JSON.stringify(data)
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message)
      }
    })
  }

  // UDP forwarding for multiple applications
  addForwarder(ip, port) {
    const socket = dgram.createSocket('udp4')
    this.forwarders.push({ socket, ip, port })
  }

  forwardUDP(data) {
    const buffer = Buffer.from(JSON.stringify(data))
    this.forwarders.forEach(({ socket, ip, port }) => {
      socket.send(buffer, port, ip)
    })
  }

  start() {
    this.receiver.start()
    console.log(`Telemetry bridge: UDP:${this.udpPort} → WebSocket:${this.wsPort}`)
  }

  stop() {
    this.receiver.stop()
    this.wss.close()
    this.forwarders.forEach(({ socket }) => socket.close())
  }
}

export default TelemetryBridge