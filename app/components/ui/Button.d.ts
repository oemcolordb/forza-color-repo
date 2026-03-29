import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType
  href?: string
  target?: string
  rel?: string
  variant?: 'primary' | 'ghost' | 'danger' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>

export default Button
