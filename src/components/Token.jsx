// 말 하나의 모양 (팀 색 동그라미 + 동물 얼굴)
import AnimalIcon from './AnimalIcon.jsx'

export default function Token({ team, size = 52, count, selected, resting, dim, className = '', ...rest }) {
  return (
    <div
      className={`token ${selected ? 'is-selected' : ''} ${dim ? 'is-dim' : ''} ${className}`}
      style={{ '--team': team.color, width: size, height: size }}
      {...rest}
    >
      <AnimalIcon animal={team.animal} size={size * 0.78} />
      {count > 1 && <span className="token-badge">×{count}</span>}
      {resting && <span className="token-rest">쉬기</span>}
    </div>
  )
}
