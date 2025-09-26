#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const server = new Server(
  {
    name: 'forza-color-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Add your MCP handlers here
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'forza://colors',
        name: 'Forza Colors',
        description: 'Access to Forza color data',
        mimeType: 'application/json',
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);