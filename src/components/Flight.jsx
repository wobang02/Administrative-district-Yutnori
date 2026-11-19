// 헬리콥터 / 비행기가 출발지에서 도착지로 날아가는 연출
import { useEffect, useState } from 'react'
import { NODES } from '../data/board.js'

function Helicopter() {
  return (
    <svg viewBox="0 0 120 80" width="110" height="74" aria-hidden="true">
      <g className="rotor"><rect x="10" y="6" width="100" height="5" rx="2.5" fill="#2a2420" /></g>
      <rect x="57" y="10" width="6" height="12" fill="#2a2420" />
      <path d="M30 40 q0 -18 30 -18 h8 q22 0 22 20 q0 14 -22 14 h-24 q-14 0 -14 -16 z" fill="#ffcf3f" stroke="#2a2420" strokeWidth="3" />
      <path d="M68 26 q16 2 18 16 h-18 z" fill="#bfe3ff" stroke="#2a2420" strokeWidth="2.5" />
      <path d="M30 40 h-24 l-4 -10 h6 l6 6 h16" fill="#ffcf3f" stroke="#2a2420" strokeWidth="3" strokeLinejoin="round" />
      <path d="M44 56 v8 M74 56 v8 M36 66 h48" stroke="#2a2420" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function Airplane() {
  return (
    <svg viewBox="0 0 120 80" width="110" height="74" aria-hidden="true">
      <path d="M8 40 q0 -8 14 -8 h70 q20 0 24 8 q-4 8 -24 8 h-70 q-14 0 -14 -8 z" fill="#fff" stroke="#2a2420" strokeWidth="3" />
      <path d="M48 34 l20 -26 h10 l-10 26 z M48 46 l20 26 h10 l-10 -26 z" fill="#2f6fde" stroke="#2a2420" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 34 l-6 -14 h8 l10 14 z" fill="#2f6fde" stroke="#2a2420" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="96" cy="40" r="3" fill="#2a2420" /><circle cx="86" cy="40" r="3" fill="#2a2420" /><circle cx="76" cy="40" r="3" fill="#2a2420" />
    </svg>
  )
}

export default function Flight({ from, to, kind, pct }) {
  const a = NODES[from]
  const b = NODES[to]
  const [at, setAt] = useState(a)
  useEffect(() => {
    // 두 프레임 뒤에 목적지로 좌표를 바꿔 CSS transition이 날아가는 모습을 만듭니다.
    let r2
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setAt(b)) })
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2) }
  }, [b])
  const flip = b.x < a.x
  return (
    <div className="flight" style={pct(at.x, at.y)}>
      <div style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
        {kind === 'plane' ? <Airplane /> : <Helicopter />}
      </div>
    </div>
  )
}
