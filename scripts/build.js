#!/usr/bin/env node
/**
 * Build script with self polyfill for server-side bundles
 */

// Set self as globalThis before any imports
if (typeof self === 'undefined') {
  global.self = globalThis
}

// Also set it on process.env so child processes inherit it via NODE_OPTIONS
const path = require('path')
const polyfillPath = path.join(__dirname, 'self-polyfill.js')
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ` --require ${polyfillPath}`

// Run Next.js build directly
const nextCli = require('next/dist/bin/next')

// Override process.argv to pass the build command
process.argv = ['node', 'next', 'build', ...process.argv.slice(2)]
