// 룰렛 팝업
//  - Wheel: 칸 목록(items)만 넘기면 어떤 룰렛이든 만들 수 있는 공통 부품
//  - SejongRoulette: 세종 '긴급 출장 명령' (남북한 27개 행정구역 중 한 곳)
//  - BonusRoulette: 퀴즈 정답 보상 (좋은 칸·나쁜 칸이 섞여 있음)
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import AnimalIcon from './AnimalIcon.jsx'
import { ROULETTE_REGIONS, REGIONS_NORTH } from '../data/board.js'
import { sfx } from '../game/sound.js'
import { ro } from '../game/korean.js'

const R = 230

function Wheel({ team, tone, kicker, title, hub, items, labelSize = 26, radial = false, resultFor, onDone }) {
  const N = items.length
  const SLICE = 360 / N
  const [rotation, setRotation] = useState(0)
  const [phase, setPhase] = useState('ready') // ready | spinning | result
  const [picked, setPicked] = useState(null)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const slicePath = (i) => {
    const a0 = ((i * SLICE - 90 - SLICE / 2) * Math.PI) / 180
    const a1 = (((i + 1) * SLICE - 90 - SLICE / 2) * Math.PI) / 180
    return `M0 0 L${R * Math.cos(a0)} ${R * Math.sin(a0)} A${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`
  }

  const spin = () => {
    if (phase !== 'ready') return
    const idx = Math.floor(Math.random() * N)
    // idx번째 칸이 위쪽 화살표에 오도록 회전 각도를 계산 (6바퀴 + 남은 각도)
    setRotation(360 * 6 + (360 - idx * SLICE))
    setPhase('spinning')
    let t = 0
    for (let k = 0; k < 34; k++) {
      t += 40 + k * k * 0.32
      timers.current.push(setTimeout(sfx.tick, t))
    }
    timers.current.push(setTimeout(() => { setPicked(idx); setPhase('result'); sfx.event() }, 4300))
  }

  const result = picked !== null ? resultFor(items[picked]) : null

  return (
    <Modal tone={tone} wide>
      <span className="team-tag" style={{ '--team': team.color }}>
        <AnimalIcon animal={team.animal} size={30} /> {team.name}
      </span>
      <p className="modal-kicker">{kicker}</p>
      <h2 className="modal-title">{title}</h2>
      <div className="roulette">
        <div className="roulette-pointer" />
        <svg viewBox="-250 -250 500 500" className="roulette-svg">
          <g style={{ transform: `rotate(${rotation}deg)`, transition: phase === 'ready' ? 'none' : 'transform 4.2s cubic-bezier(.12,.7,.18,1)' }}>
            {items.map((it, i) => (
              <g key={i}>
                <path d={slicePath(i)} fill={it.color} stroke="#fff" strokeWidth="3" />
                <text
                  // radial: 칸이 많을 때 글자를 바깥→가운데 방향으로 세워서 겹치지 않게
                  // (왼쪽 절반은 글자가 뒤집히지 않도록 반대로 돌려요)
                  transform={!radial ? `rotate(${i * SLICE}) translate(0 ${-R + 46})`
                    : i * SLICE > 180 ? `rotate(${i * SLICE + 90}) translate(${-(R - 16)} 0)` : `rotate(${i * SLICE - 90}) translate(${R - 16} 0)`}
                  textAnchor={!radial ? 'middle' : i * SLICE > 180 ? 'start' : 'end'}
                  dominantBaseline={radial ? 'central' : undefined}
                  className={`roulette-label ${picked === i ? 'is-picked' : ''}`}
                  style={{ fontSize: labelSize }}
                >
                  {it.label}
                </text>
              </g>
            ))}
          </g>
          <circle r="44" fill="#2a2420" />
          <text y="9" textAnchor="middle" className="roulette-hub">{hub}</text>
        </svg>
      </div>
      {result ? (
        <>
          <p className={`roulette-result ${result.tone || ''}`}>{result.text}</p>
          {result.sub && <p className="modal-desc">{result.sub}</p>}
          <div className="modal-actions">
            <button className="btn-primary" onClick={() => onDone(items[picked])}>{result.button}</button>
          </div>
        </>
      ) : (
        <div className="modal-actions">
          <button className="btn-primary" onClick={spin} disabled={phase !== 'ready'}>
            {phase === 'ready' ? '룰렛 돌리기' : '돌아가는 중…'}
          </button>
        </div>
      )}
    </Modal>
  )
}

// 남한 칸은 따뜻한 색, 북한 칸은 차가운 색으로 구분
const SOUTH_COLORS = ['#ffe7a8', '#ffd6cf', '#d4f1df', '#ffe2bf']
const NORTH_COLORS = ['#cfe6ff', '#eadcff', '#c9eef0']

export function SejongRoulette({ team, onDone }) {
  const north = new Set(REGIONS_NORTH)
  let si = 0, ni = 0
  const items = ROULETTE_REGIONS.map((name) => ({
    label: name,
    color: north.has(name) ? NORTH_COLORS[ni++ % NORTH_COLORS.length] : SOUTH_COLORS[si++ % SOUTH_COLORS.length],
  }))
  return (
    <Wheel
      team={team}
      tone="sejong"
      kicker="세종특별자치시 도착"
      title="긴급 출장 명령!"
      hub="출장"
      items={items}
      radial
      labelSize={19}
      resultFor={(it) =>
        it.label === '세종'
          ? { text: '세종에서 그대로 근무합니다', button: '확인' }
          : { text: `${ro(it.label)} 출장 발령!`, button: '헬리콥터 출발' }}
      onDone={(it) => onDone(it.label)}
    />
  )
}

// 보상 룰렛 칸: good(좋음) / bad(나쁨) / none(꽝)이 번갈아 놓여 있어요.
// 칸을 바꾸거나 추가하려면 이 목록만 고치면 됩니다. (효과는 App.jsx 의 applyBonus)
const GOOD = '#cdeedb'
const BAD = '#ffd3cc'
export const BONUS_ITEMS = [
  { key: 'extra', label: '한 번 더', color: GOOD, text: '윷을 한 번 더 던져요!' },
  { key: 'rest', label: '한 턴 쉬기', color: BAD, text: '다음 차례를 한 번 쉬어요' },
  { key: 'piggy', label: '말 업기', color: GOOD, text: '대기 중인 우리 말 하나를 업어요!' },
  { key: 'back1', label: '한 칸 뒤로', color: BAD, text: '한 칸 뒤로 물러나요' },
  { key: 'swap', label: '위치 바꾸기', color: GOOD, text: '상대 말과 자리를 바꿔요!', sub: '확인을 누른 뒤 지도에서 바꿀 상대 말을 누르세요.' },
  { key: 'back2', label: '두 칸 뒤로', color: BAD, text: '두 칸 뒤로 물러나요' },
  { key: 'fwd2', label: '두 칸 앞으로', color: GOOD, text: '두 칸 앞으로 성큼!' },
  { key: 'none', label: '꽝', color: '#ece7de', text: '꽝! 아무 일도 없어요' },
]

export function BonusRoulette({ team, nodeName, onDone }) {
  return (
    <Wheel
      team={team}
      tone="quiz"
      kicker={`${nodeName} 퀴즈 정답!`}
      title="보상 룰렛"
      hub="보상"
      items={BONUS_ITEMS}
      labelSize={24}
      resultFor={(it) => ({
        text: it.text,
        sub: it.sub,
        tone: it.color === GOOD ? 'is-good' : it.color === BAD ? 'is-bad' : '',
        button: '확인',
      })}
      onDone={onDone}
    />
  )
}
