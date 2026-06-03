import { NextResponse } from 'next/server'

/**
 * GET /api/version
 *
 * Returns the current application version and git commit info
 * Used by Service Worker to detect version changes and trigger cache updates
 */
export async function GET() {
  // Get version from package.json (injected by build system)
  const packageVersion = process.env.npm_package_version || '1.0.0'

  // Get git commit SHA from Vercel environment
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local'

  // Get git branch
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || 'local'

  // Build timestamp
  const buildTime = process.env.VERCEL_DEPLOYMENT_CREATED_AT || new Date().toISOString()

  return NextResponse.json({
    version: packageVersion,
    commit: commitSha,
    branch: gitBranch,
    buildTime,
    timestamp: new Date().toISOString(),
  })
}
