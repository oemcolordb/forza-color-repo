import React from 'react'

interface Props {
  children: React.ReactNode
}

const ResponsiveLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {children}
    </div>
  )
}

export default ResponsiveLayout