'use client'

import React from 'react'
import { useAccessibleDialog } from '@/hooks/useAccessibleDialog'

const DialogShell = ({
  isOpen,
  onClose,
  titleId,
  panelClassName,
  overlayClassName = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60',
  initialFocusRef,
  children,
}) => {
  const dialogRef = React.useRef(null)

  useAccessibleDialog({
    isOpen,
    onClose,
    dialogRef,
    initialFocusRef,
  })

  if (!isOpen) return null

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div
        ref={dialogRef}
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={event => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default DialogShell
