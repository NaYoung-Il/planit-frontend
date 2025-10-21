import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// 트리거 요소에 고정되는 떠있는 패널, 바깥 클릭 시 닫힘
export default function Popover({ open, onClose, anchorClass, children }) {
  const ref = useRef()
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [entered, setEntered] = useState(false)

  // 바깥 클릭 시 닫힘
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (!ref.current) return
      const anchor = document.querySelector(anchorClass)
      const isInPopover = ref.current.contains(e.target)
      const isInAnchor = anchor && anchor.contains(e.target)
      if (!isInPopover && !isInAnchor) {
        onClose?.()
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, anchorClass, onClose])

  // 앵커 바로 아래에 위치, 오른쪽 정렬
  useEffect(() => {
    if (!open) return
    const update = () => {
      const anchor = document.querySelector(anchorClass)
      const el = ref.current
      if (!anchor || !el) return
      const r = anchor.getBoundingClientRect()
      const w = el.offsetWidth
      const gap = 8
      const top = r.bottom + gap
      let left = r.left + (r.width - w) / 2
      left = Math.max(gap, Math.min(window.innerWidth - w - gap, left))
      setPos({ top, left })
    }
    const id = requestAnimationFrame(() => {
      update()
      requestAnimationFrame(() => setEntered(true))
    })
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      setEntered(false)
    }
  }, [open, anchorClass])

  if (!open) return null
  const style = {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    zIndex: 1000,
    transform: entered ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
    opacity: entered ? 1 : 0,
    transition: 'opacity 160ms ease, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)'
  }
  return createPortal(
    <div
      className="w-[300px] rounded-lg p-4 border border-primary-dark/15 shadow-[0_8px_28px_rgba(16,185,129,0.18)] relative"
      ref={ref}
      role="dialog"
      style={{
        ...style,
        background: 'linear-gradient(135deg, rgba(240,253,244,0.85) 0%, rgba(255,255,255,0.72) 100%)',
        backdropFilter: 'blur(10px) saturate(140%)',
      }}
    >
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border border-primary-dark/15 border-b-0 border-r-0 rotate-45 bg-[linear-gradient(135deg,rgba(240,253,244,0.85)_0%,rgba(255,255,255,0.72)_100%)]" style={{backdropFilter: 'blur(10px) saturate(140%)'}}></div>
      {children}
    </div>,
    document.body
  )
}
