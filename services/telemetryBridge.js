/**
 * services/telemetryBridge.js
 * 
 * Bridges UDP telemetry from Forza Horizon 5 to WebSocket clients.
 */

import dgram from 'dgram';
import { WebSocketServer } from 'ws';

export default class TelemetryBridge {
  constructor(udpPort = 5300, wsPort = 8080) {
    this.udpPort = udpPort;
    this.wsPort = wsPort;
    this.udpSocket = null;
    this.wss = null;
    this.forwarders = [];
  }

  addForwarder(ip, port) {
    this.forwarders.push({ ip, port });
    console.log(`[Telemetry] Added forwarder: ${ip}:${port}`);
  }

  start() {
    // Start WebSocket Server
    this.wss = new WebSocketServer({ port: this.wsPort });
    this.wss.on('connection', (ws) => {
      console.log('[Telemetry] Client connected to WebSocket');
    });

    // Start UDP Receiver
    this.udpSocket = dgram.createSocket('udp4');
    
    this.udpSocket.on('message', (msg, rinfo) => {
      // Broadcast to all WS clients
      if (this.wss) {
        this.wss.clients.forEach((client) => {
          if (client.readyState === 1) { // OPEN
            client.send(msg);
          }
        });
      }

      // Forward to other UDP endpoints
      this.forwarders.forEach((f) => {
        this.udpSocket.send(msg, f.port, f.ip);
      });
    });

    this.udpSocket.on('listening', () => {
      const address = this.udpSocket.address();
      console.log(`[Telemetry] UDP listening on ${address.address}:${address.port}`);
    });

    this.udpSocket.bind(this.udpPort);
  }

  stop() {
    if (this.udpSocket) this.udpSocket.close();
    if (this.wss) this.wss.close();
    console.log('[Telemetry] Stopped.');
  }
}
