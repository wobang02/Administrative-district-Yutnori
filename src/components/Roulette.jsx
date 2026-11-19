// 세종 '긴급 출장 명령' 룰렛: 17개 시·도 중 한 곳을 무작위로 고릅니다.
import { useRef, useState } from 'react'
import Modal from './Modal.jsx'
import AnimalIcon from './AnimalIcon.jsx'
import { REGIONS_17 } from '../data/board.js'
import { sfx } from '../game/sound.js'
import { ro } from '../game/korean.js'

const N = REGIONS_17.length
const SLICE = 360 / N
const R = 230
const COLORS = ['#ffe7a8', '#cfe6ff', '#ffd6cf', '#d4f1df', '#eadcff']

function slicePath(i) {
  const a0 = ((i * SLICE - 90 - SLICE / 2) * Math.PI) / 180
  const a1 = (((i + 1) * SLICE - 90 - SLICE / 2) * Math.PI) / 180
  return `M0 0 L${R * Math.cos(a0)} ${R * Math.sin(a0)} A${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`
}

export default function Roulette({ team, onDone }) {
  const [rotation, setRotation] = useState(0)
  const [phase, setPhase] = useState('ready') // ready | spinning | result
  const [picked, setPicked] = useState(null)
  const timers = useRef([])

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
    timers.current.push(setTimeout(() => { setPicked(REGIONS_17[idx]); setPhase('result'); sfx.event() }, 4300))
  }

  return (
    <Modal tone="sejong" wide>
      <span className="team-tag" style={{ '--team': team.color }}>
        <AnimalIcon animal={team.animal} size={30} /> {team.name}
      </span>
      <p className="modal-kicker">세종특별자치시 도착</p>
      <h2 className="modal-title">긴급 출장 명령!</h2>
      <div className="roulette">
        <div className="roulette-pointer" />
        <svg viewBox="-250 -250 500 500" className="roulette-svg">
          <g style={{ transform: `rotate(${rotation}deg)`, transition: phase === 'spinning' || phase === 'result' ? 'transform 4.2s cubic-bezier(.12,.7,.18,1)' : 'none' }}>
            {REGIONS_17.map((name, i) => {
              const ang = i * SLICE
              return (
                <g key={name}>
                  <path d={slicePath(i)} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="3" />
                  <text transform={`rotate(${ang}) translate(0 ${-R + 46})`} textAnchor="middle" className={`roulette-label ${picked === name ? 'is-picked' : ''}`}>
                    {name}
                  </text>
                </g>
              )
            })}
          </g>
          <circle r="44" fill="#2a2420" />
          <text y="9" textAnchor="middle" className="roulette-hub">출장</text>
        </svg>
      </div>
      {phase === 'result' ? (
        <>
          <p className="roulette-result">
            {picked === '세종' ? '세종에서 그대로 근무합니다' : `${ro(picked)} 출장 발령!`}
          </p>
          <div className="modal-actions">
            <button className="btn-primary" onClick={() => onDone(picked)}>
              {picked === '세종' ? '확인' : '헬리콥터 출발'}
            </button>
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
