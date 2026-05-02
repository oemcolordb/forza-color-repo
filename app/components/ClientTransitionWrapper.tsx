'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const TransitionWrapperDynamic = dynamic(
  async () => {
    const mod = await import('./transitions/TransitionWrapper')
    return mod.TransitionWrapper
  },
  { ssr: false }
)

export default function ClientTransitionWrapper({ children }: { children: React.ReactNode }) {
  return <TransitionWrapperDynamic>{children}</TransitionWrapperDynamic>
}
