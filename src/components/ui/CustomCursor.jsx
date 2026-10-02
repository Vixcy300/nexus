import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [cursorState, setCursorState] = useState('default') // 'default'|'hover'|'text'|'view'
  const [isVisible, setIsVisible] = useState(false)

  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)

  // Outer trailing ring — slower
  const trailX = useSpring(mouseX, { stiffness: 120, damping: 22 })
  const trailY = useSpring(mouseY, { stiffness: 120, damping: 22 })

  // Inner dot — snappier
  const dotX = useSpring(mouseX, { stiffness: 600, damping: 38 })
  const dotY = useSpring(mouseY, { stiffness: 600, damping: 38 })

  useEffect(() => {
    // Hide on touch/mobile devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0)
    if (isTouch) {
      setIsTouchDevice(true)
      return
    }

    const onMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const onEnter = () => setIsVisible(true)
    const onLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [mouseX, mouseY, isVisible])

  useEffect(() => {
    if (isTouchDevice) return

    const handleOver = (e) => {
      const el = e.target.closest('[data-cursor]')
      setCursorState(el ? (el.getAttribute('data-cursor') || 'hover') : 'default')
    }
    document.addEventListener('mouseover', handleOver)
    return () => document.removeEventListener('mouseover', handleOver)
  }, [isTouchDevice])

  // Don't render at all on touch devices or until first movement
  if (isTouchDevice) return null

  const dotVariants = {
    default: { width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffffff', opacity: isVisible ? 1 : 0 },
    hover:   { width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', opacity: 1 },
    text:    { width: 3,  height: 20, borderRadius: '2px', backgroundColor: '#ffffff', opacity: 1 },
    view:    { width: 56, height: 56, borderRadius: '50%', backgroundColor: 'transparent', border: '1.5px solid #ffffff', opacity: 1 },
  }

  const ringVariants = {
    default: { width: 34, height: 34, opacity: isVisible ? 0.25 : 0, border: '1px solid #ffffff', backgroundColor: 'transparent' },
    hover:   { width: 0,  height: 0,  opacity: 0 },
    text:    { width: 0,  height: 0,  opacity: 0 },
    view:    { width: 0,  height: 0,  opacity: 0 },
  }

  return (
    <>
      {/* Inner dot / shape */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          mixBlendMode: 'difference',
        }}
        variants={dotVariants}
        animate={cursorState}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      >
        {cursorState === 'hover' && (
          <span className="absolute inset-0 flex items-center justify-center text-ink-950 font-mono text-[9px] font-bold tracking-widest">
            CLICK
          </span>
        )}
        {cursorState === 'view' && (
          <span className="absolute inset-0 flex items-center justify-center text-white font-mono text-[9px] font-bold tracking-widest">
            VIEW
          </span>
        )}
      </motion.div>

      {/* Trailing ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          mixBlendMode: 'difference',
        }}
        variants={ringVariants}
        animate={cursorState}
        transition={{ duration: 0.15 }}
      />
    </>
  )
}
