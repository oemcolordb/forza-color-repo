/**
 * Manually runs @netlify/plugin-nextjs lifecycle hooks
 * to produce the correct Netlify function output from a pre-built .next dir
 */
import * as plugin from '@netlify/plugin-nextjs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, cpSync } from 'fs'
import { symlink as origSymlink } from 'fs/promises'
import * as fsPromises from 'fs/promises'

// Patch symlink to use junction or copy on Windows (symlinks require admin or Developer Mode)
const origSymlinkFn = fsPromises.symlink.bind(fsPromises)
fsPromises.symlink = async (target, symlinkPath, type) => {
  try {
    await origSymlinkFn(target, symlinkPath, 'junction')
  } catch {
    // Junction failed — try a directory copy fallback
    try {
      const { resolve, dirname } = await import('path')
      const { cp, mkdir } = await import('fs/promises')
      const base = dirname(symlinkPath)
      const src = resolve(base, target)
      await mkdir(dirname(symlinkPath), { recursive: true })
      if ((await import('fs')).existsSync(src)) {
        await cp(src, symlinkPath, { recursive: true, force: true })
      }
    } catch {
      // Non-critical — skip silently
    }
  }
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = resolve(__dirname, '..')
process.chdir(root)
const netlifyDir = resolve(root, '.netlify')

if (!existsSync(netlifyDir)) mkdirSync(netlifyDir, { recursive: true })

const utils = {
  build: {
    failBuild: (msg) => { console.error('failBuild:', msg); console.error('CWD:', process.cwd()); process.exit(1) },
    failPlugin: (msg) => { console.error('failPlugin:', msg); process.exit(1) },
    cancelBuild: (msg) => { console.error('cancelBuild:', msg); process.exit(1) },
  },
  status: {
    show: (opts) => console.log('status.show:', opts),
  },
  run: {
    command: async (cmd) => {
      const { execSync } = await import('child_process')
      execSync(cmd, { stdio: 'inherit', cwd: root })
    },
  },
  cache: {
    save: async () => {},
    restore: async () => false,
    list: async () => [],
    has: async () => false,
  },
}

const constants = {
  PUBLISH_DIR: '.next',
  INTERNAL_FUNCTIONS_SRC: resolve(root, '.netlify/functions-internal'),
  INTERNAL_EDGE_FUNCTIONS_SRC: resolve(root, '.netlify/edge-functions-internal'),
  FUNCTIONS_SRC: resolve(root, 'netlify/functions'),
  FUNCTIONS_DIST: resolve(root, '.netlify/functions'),
  EDGE_FUNCTIONS_SRC: resolve(root, 'netlify/edge-functions'),
  EDGE_FUNCTIONS_DIST: resolve(root, '.netlify/edge-functions'),
  IS_LOCAL: false,
  NETLIFY_BUILD_VERSION: '35.13.4',
  SITE_ID: 'b698e9e4-0eb4-464e-9556-a02b6435c0ad',
  CACHE_DIR: resolve(root, '.netlify/cache'),
  PACKAGE_PATH: '',
}

const inputs = {}

const netlifyConfig = {
  build: {
    publish: '.next',
    command: 'npm run build',
    environment: {},
    processing: { css: { bundle: false, minify: false }, js: { bundle: false, minify: false }, html: { pretty_urls: false }, images: { compress: false } },
  },
  redirects: [],
  headers: [],
  functions: {},
  plugins: [],
  edge_functions: [],
  _generated: {},
}

const ctx = { utils, constants, inputs, netlifyConfig }

console.log('Running onPreBuild...')
if (plugin.onPreBuild) await plugin.onPreBuild(ctx).catch(e => console.warn('onPreBuild error (non-fatal):', e.message))

console.log('Running onBuild...')
if (plugin.onBuild) await plugin.onBuild(ctx).catch(e => { console.error('onBuild error:', e.message, e.stack); process.exit(1) })

console.log('Running onPostBuild...')
if (plugin.onPostBuild) await plugin.onPostBuild(ctx).catch(e => console.warn('onPostBuild error (non-fatal):', e.message))

console.log('Done.')
