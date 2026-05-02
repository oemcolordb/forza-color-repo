// Server-side polyfills for browser globals
if (typeof self === 'undefined') {
  globalThis.self = globalThis
}
