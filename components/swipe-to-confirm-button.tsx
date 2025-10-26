'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

interface SwipeToConfirmButtonProps {
  onConfirm: () => void
  text?: string
  confirmText?: string
  disabled?: boolean
}

export function SwipeToConfirmButton({
  onConfirm,
  text = 'Deslize para confirmar',
  confirmText = 'Encerrar Corrida',
  disabled = false,
}: SwipeToConfirmButtonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const startX = useRef(0)

  const maxPosition = containerRef.current
    ? containerRef.current.offsetWidth - (buttonRef.current?.offsetWidth || 60)
    : 0

  const threshold = maxPosition * 0.85 // 85% of the way

  useEffect(() => {
    if (confirmed) {
      const timer = setTimeout(() => {
        onConfirm()
        // Reset after confirmation
        setConfirmed(false)
        setPosition(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [confirmed, onConfirm])

  const handleStart = (clientX: number) => {
    if (disabled) return
    setIsDragging(true)
    startX.current = clientX - position
  }

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return

    const newPosition = clientX - startX.current
    const clampedPosition = Math.max(0, Math.min(newPosition, maxPosition))
    setPosition(clampedPosition)
  }

  const handleEnd = () => {
    if (disabled) return
    setIsDragging(false)

    if (position >= threshold) {
      // Confirmed
      setPosition(maxPosition)
      setConfirmed(true)
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

  const progressPercentage = maxPosition > 0 ? (position / maxPosition) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={`relative h-14 bg-destructive/10 rounded-full overflow-hidden border-2 border-destructive ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {/* Progress background */}
      <div
        className="absolute inset-0 bg-destructive/30 transition-all"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-sm font-semibold transition-opacity ${
            progressPercentage > 50 ? 'opacity-0' : 'opacity-100'
          } text-destructive`}
        >
          {text}
        </span>
        <span
          className={`text-sm font-semibold transition-opacity absolute ${
            progressPercentage > 50 ? 'opacity-100' : 'opacity-0'
          } text-destructive-foreground`}
        >
          Solte para {confirmText.toLowerCase()}
        </span>
      </div>

      {/* Draggable button */}
      <button
        ref={buttonRef}
        className={`absolute left-1 top-1 bottom-1 w-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isDragging ? 'scale-110 shadow-xl' : 'scale-100'
        } ${confirmed ? 'bg-green-600' : 'bg-destructive'}`}
        style={{
          transform: `translateX(${position}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
      >
        <ChevronRight className="h-6 w-6 text-destructive-foreground" />
      </button>
    </div>
  )
}
