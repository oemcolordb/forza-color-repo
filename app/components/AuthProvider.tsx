import React from 'react'

interface Props {
  children: React.ReactNode
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  return <>{children}</>
}

export { AuthProvider }