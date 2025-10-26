'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface SwipePassengerControlProps {
  onConfirm: () => void
  onRemove: () => void
  passengerName: string
  isConfirmed: boolean
}

export function SwipePassengerControl({
  onConfirm,
  onRemove,
  passengerName,
  isConfirmed,
}: SwipePassengerControlProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(0)
  const [action, setAction] = useState<'none' | 'confirm' | 'remove'>('none')
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const startX = useRef(0)

  const maxPosition = containerRef.current
    ? containerRef.current.offsetWidth - (buttonRef.current?.offsetWidth || 60)
    : 0

  const threshold = maxPosition * 0.7 // 70% of the way
  const removeThreshold = -maxPosition * 0.7 // -70% for remove (left swipe)

  useEffect(() => {
    if (action !== 'none') {
      const timer = setTimeout(() => {
        if (action === 'confirm') {
          onConfirm()
        } else if (action === 'remove') {
          onRemove()
        }
        // Reset
        setAction('none')
        setPosition(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [action, onConfirm, onRemove])

  const handleStart = (clientX: number) => {
    setIsDragging(true)
    startX.current = clientX - position
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return

    const newPosition = clientX - startX.current
    const clampedPosition = Math.max(-maxPosition, Math.min(newPosition, maxPosition))
    setPosition(clampedPosition)
  }

  const handleEnd = () => {
    setIsDragging(false)

    if (position >= threshold) {
      // Confirmed - swipe right
      setPosition(maxPosition)
      setAction('confirm')
    } else if (position <= removeThreshold) {
      // Remove - swipe left
      setPosition(-maxPosition)
      setAction('remove')
    } else {
      // Reset
      setPosition(0)
    }
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  useEffect(() => {
    if (isDragging) {
      const onMouseMove = (e: MouseEvent) => handleMove(e.clientX)
      const onMouseUp = () => handleEnd()

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
    }
  }, [isDragging, position])

  const progressPercentage = maxPosition > 0 ? Math.abs(position / maxPosition) * 100 : 0
  const direction = position >= 0 ? 'right' : 'left'

  return (
    <div
      ref={containerRef}
      className="relative h-14 bg-muted/30 rounded-lg overflow-hidden border-2 border-muted"
    >
      {/* Left background (Remove) */}
      <div
        className="absolute inset-0 bg-status-error/20 transition-all"
        style={{
          width: direction === 'left' ? `${progressPercentage}%` : '0%',
        }}
      />

      {/* Right background (Confirm) */}
      <div
        className="absolute inset-0 bg-green-500/20 transition-all"
        style={{
          width: direction === 'right' ? `${progressPercentage}%` : '0%',
          left: direction === 'right' ? 'auto' : '0',
          right: direction === 'right' ? '0' : 'auto',
        }}
      />

      {/* Left action hint (Remove) */}
      <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
        <div
          className={`flex items-center gap-2 transition-opacity ${
            direction === 'left' && progressPercentage > 30 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <X className="h-5 w-5 text-status-error" />
          <span className="text-sm font-semibold text-status-error">
            {isConfirmed ? 'Remover' : 'Recusar'}
          </span>
        </div>
      </div>

      {/* Right action hint (Confirm) */}
      <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
        <div
          className={`flex items-center gap-2 transition-opacity ${
            direction === 'right' && progressPercentage > 30 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-sm font-semibold text-green-600">Confirmar</span>
          <Check className="h-5 w-5 text-green-600" />
        </div>
      </div>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-sm font-medium transition-opacity ${
            progressPercentage > 30 ? 'opacity-0' : 'opacity-100'
          } text-foreground`}
        >
          {isConfirmed ? 'Deslize para remover' : 'Deslize para confirmar ou recusar'}
        </span>
      </div>

      {/* Draggable button */}
      <button
        ref={buttonRef}
        className={`absolute left-1 top-1 bottom-1 w-12 rounded-md flex items-center justify-center shadow-lg transition-all ${
          isDragging ? 'scale-110' : 'scale-100'
        } ${
          action === 'confirm'
            ? 'bg-green-500'
            : action === 'remove'
            ? 'bg-status-error'
            : 'bg-primary'
        }`}
        style={{
          transform: `translateX(${position}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {action === 'confirm' ? (
          <Check className="h-6 w-6 text-white" />
        ) : action === 'remove' ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white rounded-full" />
            <div className="w-1 h-4 bg-white rounded-full" />
            <div className="w-1 h-4 bg-white rounded-full" />
          </div>
        )}
      </button>
    </div>
  )
}
