// 모둠 동물 아바타: 코드로 직접 그린 단순한 SVG (외부 그림 없음)
const INK = '#2a2420'

function Tiger() {
  return (
    <g>
      <circle cx="13" cy="13" r="6" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="35" cy="13" r="6" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="24" cy="26" r="15" fill="#fff" stroke={INK} strokeWidth="2.4" />
      <path d="M19 13 l2 5 M24 12 v6 M29 13 l-2 5" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 25 h5 M10 30 h5 M38 25 h-5 M38 30 h-5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="19" cy="25" r="2" fill={INK} />
      <circle cx="29" cy="25" r="2" fill={INK} />
      <path d="M21.5 30 h5 l-2.5 3 z" fill={INK} />
      <path d="M20 35 q4 3 8 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Bear() {
  return (
    <g>
      <circle cx="12" cy="13" r="6.5" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="36" cy="13" r="6.5" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="24" cy="26" r="15" fill="#fff" stroke={INK} strokeWidth="2.4" />
      <circle cx="18.5" cy="23" r="2.1" fill={INK} />
      <circle cx="29.5" cy="23" r="2.1" fill={INK} />
      <ellipse cx="24" cy="31" rx="7" ry="5.5" fill="#fff" stroke={INK} strokeWidth="2" />
      <ellipse cx="24" cy="29" rx="2.8" ry="2" fill={INK} />
      <path d="M24 31 v2.5" stroke={INK} strokeWidth="1.8" />
    </g>
  )
}

function Magpie() {
  return (
    <g>
      <path d="M8 34 L2 42 L12 37 Z" fill={INK} />
      <ellipse cx="22" cy="28" rx="15" ry="11" fill={INK} />
      <ellipse cx="22" cy="32" rx="9" ry="6" fill="#fff" />
      <circle cx="32" cy="18" r="8.5" fill={INK} />
      <path d="M39 17 L46 19.5 L39 21.5 Z" fill="#f0a400" stroke={INK} strokeWidth="1" />
      <circle cx="34" cy="16.5" r="2.2" fill="#fff" />
      <circle cx="34.4" cy="16.5" r="1.1" fill={INK} />
    </g>
  )
}

function Haetae() {
  const mane = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    return <circle key={i} cx={24 + Math.cos(a) * 15} cy={26 + Math.sin(a) * 15} r="4.6" fill="#fff" stroke={INK} strokeWidth="1.8" />
  })
  return (
    <g>
      {mane}
      <path d="M24 2 L27 11 L21 11 Z" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="24" cy="26" r="12.5" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <path d="M17 21 q2 -2 4 0 M27 21 q2 -2 4 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="24.5" r="1.9" fill={INK} />
      <circle cx="29" cy="24.5" r="1.9" fill={INK} />
      <ellipse cx="24" cy="30" rx="3.2" ry="2.2" fill={INK} />
      <path d="M19 34 q5 3.5 10 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
}

const MAP = { tiger: Tiger, bear: Bear, magpie: Magpie, haetae: Haetae }

export default function AnimalIcon({ animal, size = 40 }) {
  const Comp = MAP[animal] || Tiger
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <Comp />
    </svg>
  )
}
