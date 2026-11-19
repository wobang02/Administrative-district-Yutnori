// 말 끌어다 놓기(드래그 앤 드롭) + 짧게 누르면 "선택"으로 처리하는 훅
// 마우스와 터치(전자칠판, 태블릿)를 모두 지원하도록 Pointer Events를 사용합니다.
import { useRef, useState } from 'react'
import { NODES, VIEW_W, VIEW_H } from '../data/board.js'

export function useDrag({ boardRef, onDrop, onTap }) {
  const [drag, setDrag] = useState(null) // { pieceId, x, y, over }
  const start = useRef(null)

  const hitTest = (cx, cy) => {
    const el = document.elementFromPoint(cx, cy)
    const zone = el?.closest?.('[data-drop]')?.getAttribute('data-drop')
    if (zone) return zone // 'goal' | 'home'
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return null
    const vx = ((cx - rect.left) / rect.width) * VIEW_W
    const vy = ((cy - rect.top) / rect.height) * VIEW_H
    let best = null
    let bestD = 55
    NODES.forEach((n) => {
      const d = Math.hypot(n.x - vx, n.y - vy)
      if (d < bestD) { bestD = d; best = n.id }
    })
    return best
  }

  const handlers = (pieceId) => ({
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      start.current = { pieceId, x: e.clientX, y: e.clientY, dragging: false }
    },
    onPointerMove: (e) => {
      const s = start.current
      if (!s) return
      if (!s.dragging && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) s.dragging = true
      if (s.dragging) setDrag({ pieceId, x: e.clientX, y: e.clientY, over: hitTest(e.clientX, e.clientY) })
    },
    onPointerUp: (e) => {
      const s = start.current
      start.current = null
      setDrag(null)
      if (!s) return
      if (!s.dragging) return onTap(pieceId)
      const target = hitTest(e.clientX, e.clientY)
      if (target !== null && target !== undefined) onDrop(pieceId, target)
    },
    onPointerCancel: () => { start.current = null; setDrag(null) },
    onClick: (e) => e.stopPropagation(),
  })

  return { drag, handlers }
}
