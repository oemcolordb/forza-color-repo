const dgram = require('dgram')
const WebSocket = require('ws')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // WebSocket server for real-time data streaming
  const wss = new WebSocket.Server({ port: 8080 })

  // UDP server for Forza telemetry
  const udpServer = dgram.createSocket('udp4')

  udpServer.on('message', buffer => {
    const data = parseForza5Packet(buffer)

    // Broadcast to all connected WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })
  })

  udpServer.bind(9999)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ message: 'Telemetry server started on port 9999' }),
  }
}

function parseForza5Packet(buffer) {
  return {
    velocity: {
      x: buffer.readFloatLE(12),
      y: buffer.readFloatLE(16),
      z: buffer.readFloatLE(20),
    },
    rpm: buffer.readFloatLE(36),
    maxRpm: buffer.readFloatLE(40),
    currentGear: buffer.readUInt8(48),
    throttle: buffer.readFloatLE(52),
    brake: buffer.readFloatLE(56),
    tireTemp: [
      buffer.readFloatLE(80),
      buffer.readFloatLE(84),
      buffer.readFloatLE(88),
      buffer.readFloatLE(92),
    ],
    timestamp: Date.now(),
  }
}
