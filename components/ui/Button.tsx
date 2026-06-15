'use client'

import React, { ElementType, forwardRef } from 'react'

const variantClasses: Record<string, string> = {
  primary: 'bamboo-button text-white',
  ghost: 'bamboo-button-ghost',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-500/60',
  neutral: 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

type ButtonProps = {
  as?: ElementType
  variant?: 'primary' | 'ghost' | 'danger' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  target?: string
  rel?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    as,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    children,
    ...props
  },
  ref
) {
  const variantClass = variantClasses[variant] || variantClasses.primary
  const sizeClass = sizeClasses[size] || sizeClasses.md
  const Component = as || 'button'

  const componentProps: any = {
    ref,
    disabled,
    className: `inline-flex items-center justify-center rounded-lg font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${sizeClass} ${className}`,
    ...props,
  }

  if (Component === 'button') {
    componentProps.type = type
  }

  return (
    <Component {...componentProps}>
      {children}
    </Component>
  )
})

export default Button
