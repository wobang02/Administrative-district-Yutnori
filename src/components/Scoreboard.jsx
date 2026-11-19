// 하단 점수판: 모둠 수만큼 칸이 자동으로 나뉩니다.
import Token from './Token.jsx'
import AnimalIcon from './AnimalIcon.jsx'

export default function Scoreboard({ teams, pieces, turn, rest, quiz, selectedIds, pieceHandlers, dragOverNode, onSetTurn, onClearRest }) {
  return (
    <div className="scoreboard">
      {teams.map((t) => {
        const mine = pieces.filter((p) => p.teamId === t.id)
        const home = mine.filter((p) => p.pos === 'home')
        const goal = mine.filter((p) => p.pos === 'goal').length
        const board = mine.length - home.length - goal
        return (
          <section
            key={t.id}
            className={`team-card ${turn === t.id ? 'is-turn' : ''}`}
            style={{ '--team': t.color, '--team-soft': t.soft }}
          >
            <header className="team-head">
              <button className="team-name" onClick={() => onSetTurn(t.id)} title="이 모둠 차례로 바꾸기">
                <span className="team-avatar"><AnimalIcon animal={t.animal} size={40} /></span>
                <span>{t.name}</span>
              </button>
              {turn === t.id && <span className="turn-chip">차례</span>}
              {rest[t.id] && (
                <button className="rest-chip" onClick={() => onClearRest(t.id)} title="쉬기 표시 지우기">쉬기 ✕</button>
              )}
            </header>
            <div className="team-stats">
              <div className="stat stat-goal"><b>{goal}</b><span>/ {mine.length} 도착</span></div>
              <div className="stat"><b>{board}</b><span>판 위</span></div>
              <div className="stat"><b>{quiz[t.id] || 0}</b><span>퀴즈</span></div>
            </div>
            <div className={`home-row ${dragOverNode === 'home' ? 'is-over' : ''}`} data-drop="home">
              <span className="home-label" data-drop="home">대기 {home.length}</span>
              {home.map((p) => (
                <Token key={p.id} team={t} size={44} selected={selectedIds.includes(p.id)} {...pieceHandlers(p.id)} />
              ))}
              {home.length === 0 && <span className="home-empty" data-drop="home">모든 말이 출발했어요</span>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
