// 시작 화면: 모둠 수(2~4)와 모둠별 말 개수를 고릅니다.
import { useState } from 'react'
import { TEAM_PRESETS } from '../data/teams.js'
import AnimalIcon from './AnimalIcon.jsx'

export default function SetupScreen({ onStart, savedGame, onResume }) {
  const [count, setCount] = useState(4)
  const [pieceCount, setPieceCount] = useState(4)
  const [names, setNames] = useState(['1모둠', '2모둠', '3모둠', '4모둠'])

  return (
    <div className="setup">
      <div className="setup-card">
        <p className="setup-kicker">5학년 사회 · 우리나라 행정구역</p>
        <h1>행정구역 윷놀이판</h1>

        <div className="setup-row">
          <h2>참여 모둠 수</h2>
          <div className="seg">
            {[2, 3, 4].map((n) => (
              <button key={n} className={count === n ? 'is-on' : ''} onClick={() => setCount(n)}>{n}모둠</button>
            ))}
          </div>
        </div>

        <div className="setup-row">
          <h2>모둠별 말 개수</h2>
          <div className="seg">
            {[2, 3, 4].map((n) => (
              <button key={n} className={pieceCount === n ? 'is-on' : ''} onClick={() => setPieceCount(n)}>{n}개</button>
            ))}
          </div>
        </div>

        <div className="setup-teams" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
          {TEAM_PRESETS.slice(0, count).map((t, i) => (
            <label key={i} className="setup-team" style={{ '--team': t.color, '--team-soft': t.soft }}>
              <span className="team-avatar big"><AnimalIcon animal={t.animal} size={64} /></span>
              <span className="setup-animal">{t.animalName}</span>
              <input
                value={names[i]}
                maxLength={8}
                onChange={(e) => setNames(names.map((v, k) => (k === i ? e.target.value : v)))}
                aria-label={`${i + 1}번째 모둠 이름`}
              />
            </label>
          ))}
        </div>

        <div className="setup-actions">
          {savedGame && <button className="btn-secondary" onClick={onResume}>지난 게임 이어하기</button>}
          <button
            className="btn-primary"
            onClick={() => onStart(names.slice(0, count).map((n, i) => n.trim() || `${i + 1}모둠`), pieceCount)}
          >
            게임 시작
          </button>
        </div>
      </div>
    </div>
  )
}
