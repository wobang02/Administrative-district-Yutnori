// 지도 윷판: SVG로 지도·길·칸을 그리고, 그 위에 말(HTML)을 절대 좌표로 올립니다.
import { useEffect, useRef, useState } from 'react'
import { NODES, EDGES, VIEW_W, VIEW_H, FINISH_NODE } from '../data/board.js'
import { PROVINCES, DMZ_PATH } from '../data/provinces.js'
import Token from './Token.jsx'
import Flight from './Flight.jsx'

const pct = (x, y) => ({ left: `${(x / VIEW_W) * 100}%`, top: `${(y / VIEW_H) * 100}%` })

export const GOAL_ZONE = { x: 612, y: 262, w: 170, h: 92 }

const LINE_H = 21
function labelProps(n, r, count) {
  const up = (count - 1) * LINE_H
  switch (n.label) {
    case 'above': return { x: n.x, y: n.y - r - 9 - up, textAnchor: 'middle' }
    case 'left': return { x: n.x - r - 7, y: n.y + 7 - up / 2, textAnchor: 'end' }
    case 'right': return { x: n.x + r + 7, y: n.y + 7 - up / 2, textAnchor: 'start' }
    default: return { x: n.x, y: n.y + r + 21, textAnchor: 'middle' }
  }
}

const EVENT_BADGE = {
  quiz: { text: '?', cls: 'badge-quiz' },
  sejong: { text: '!', cls: 'badge-sejong' },
  jeju: { text: '!', cls: 'badge-jeju' },
}

export default function Board({
  teams, pieces, rest, selectedIds, admin, fx, flight, flyingIds, dragPieceId, dragOverNode,
  onNodeClick, onGoalClick, pieceHandlers, boardRef, hints, hintColor,
}) {
  const [width, setWidth] = useState(500)
  const innerRef = useRef(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const tok = Math.max(34, Math.min(76, width * 0.088))
  const hasSelection = selectedIds.length > 0

  // 칸별로 말을 묶어서, 업힌 말은 살짝 위로 겹쳐 쌓아 보여줍니다.
  const onBoard = pieces.filter((p) => typeof p.pos === 'number')
  const layout = {}
  NODES.forEach((n) => {
    const here = onBoard.filter((p) => p.pos === n.id)
    const teamIds = [...new Set(here.map((p) => p.teamId))]
    teamIds.forEach((tid, ti) => {
      const mine = here.filter((p) => p.teamId === tid)
      mine.forEach((p, k) => {
        layout[p.id] = {
          x: n.x + (ti - (teamIds.length - 1) / 2) * 38,
          lift: k * (tok * 0.16),
          z: 10 + k,
          isTop: k === mine.length - 1,
          count: mine.length,
        }
      })
    })
  })

  return (
    <div className={`board ${hasSelection ? 'has-selection' : ''} ${admin ? 'is-admin' : ''}`} ref={(el) => { innerRef.current = el; if (boardRef) boardRef.current = el }}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="board-svg" role="img" aria-label="한반도 행정구역 지도 윷판">
        <defs>
          <pattern id="waves" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 q10 -6 20 0 t20 0" stroke="#c3ddef" strokeWidth="1.5" fill="none" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="var(--sea)" />
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#waves)" opacity="0.6" />
        {/* 시·도 지도: ① 굵은 해안선 → ② 땅 색으로 안쪽 덮기 → ③ 흐릿한 시·도 경계선 */}
        <g className="provinces">
          {PROVINCES.map((pv) => <path key={`c-${pv.name}`} d={pv.d} className="pv-coast" />)}
          {PROVINCES.map((pv) => <path key={`f-${pv.name}`} d={pv.d} className="pv-fill" />)}
          {PROVINCES.map((pv) => <path key={`b-${pv.name}`} d={pv.d} className="pv-border" />)}
        </g>
        {/* 휴전선 (군사 분계선) */}
        <path d={DMZ_PATH} className="dmz" />
        <text x="318" y="662" className="map-note dmz-note" transform="rotate(-6 318 662)">휴전선</text>

        {/* 울릉도·독도 (실제보다 크게 그림) */}
        <ellipse cx={NODES[4].x} cy={NODES[4].y} rx="34" ry="28" fill="var(--land)" stroke="var(--coast)" strokeWidth="3" />
        <ellipse cx={NODES[29].x - 9} cy={NODES[29].y + 2} rx="20" ry="17" fill="var(--land)" stroke="var(--coast)" strokeWidth="3" />
        <ellipse cx={NODES[29].x + 13} cy={NODES[29].y - 4} rx="16" ry="14" fill="var(--land)" stroke="var(--coast)" strokeWidth="3" />
        <text x="640" y="660" className="map-note">동해</text>
        <text x="40" y="820" className="map-note">황해</text>
        <text x="420" y="1200" className="map-note">남해</text>

        {/* 너무 붙어 있어 비켜 그린 칸: 실제 위치와 가는 선으로 연결 */}
        {NODES.filter((n) => n.anchor).map((n) => (
          <g key={`anc-${n.id}`} className="anchor">
            <line x1={n.x} y1={n.y} x2={n.anchor[0]} y2={n.anchor[1]} />
            <circle cx={n.anchor[0]} cy={n.anchor[1]} r="5" />
          </g>
        ))}

        {/* 골인 지점 */}
        <g
          className={`goal-zone ${hints?.goal.length ? 'is-hint' : ''} ${hasSelection || dragPieceId ? 'is-active' : ''} ${dragOverNode === 'goal' ? 'is-over' : ''}`}
          data-drop="goal"
          onClick={onGoalClick}
        >
          <rect x={GOAL_ZONE.x} y={GOAL_ZONE.y} width={GOAL_ZONE.w} height={GOAL_ZONE.h} rx="16" data-drop="goal" />
          <text x={GOAL_ZONE.x + GOAL_ZONE.w / 2} y={GOAL_ZONE.y + 44} textAnchor="middle" className="goal-title" data-drop="goal">도착</text>
          <text x={GOAL_ZONE.x + GOAL_ZONE.w / 2} y={GOAL_ZONE.y + 74} textAnchor="middle" className={hints?.goal.length ? 'goal-sub goal-hint' : 'goal-sub'} data-drop="goal" style={hints?.goal.length ? { fill: hintColor } : undefined}>
            {hints?.goal.length ? `${hints.goal.join('·')} 이면 도착` : '나선에 닿은 말'}
          </text>
        </g>
        <path d={`M${NODES[FINISH_NODE].x + 12} ${NODES[FINISH_NODE].y + 34} Q 720 190 ${GOAL_ZONE.x + 100} ${GOAL_ZONE.y - 4}`} className="goal-arrow" />

        {/* 길 */}
        {EDGES.map((e, i) => {
          const a = NODES[e.a]
          const b = NODES[e.b]
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={e.sea ? 'edge edge-sea' : 'edge'} />
        })}
        {/* 이동 방향 화살표 (길 한가운데) */}
        {EDGES.map((e, i) => {
          const a = NODES[e.a]
          const b = NODES[e.b]
          const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
          return (
            <path
              key={`arr-${i}`}
              d="M-9 -11 L7 0 L-9 11 L-4 0 Z"
              transform={`translate(${(a.x + b.x) / 2} ${(a.y + b.y) / 2}) rotate(${ang})`}
              className={e.sea ? 'arrow arrow-sea' : 'arrow'}
            />
          )
        })}

        {/* 칸 */}
        {NODES.map((n) => {
          const big = n.kind === 'start' || n.kind === 'finish' || n.kind === 'hub'
          const r = big ? 30 : n.kind === 'special' ? 24 : n.kind === 'city' && !n.junction ? 17 : 22
          const lines = n.lines || [n.name]
          const hint = hints?.nodes[n.id]
          const badge = EVENT_BADGE[n.event]
          return (
            <g
              key={n.id}
              className={`node ${big ? 'node-big' : ''} node-${n.kind || 'plain'} ${n.junction ? 'node-junction' : ''} ${n.event ? `node-${n.event}` : ''} ${dragOverNode === n.id ? 'is-over' : ''}`}
              onClick={() => onNodeClick(n.id)}
              data-node={n.id}
            >
              <circle cx={n.x} cy={n.y} r={r + 14} className="node-hit" />
              {hint && <circle cx={n.x} cy={n.y} r={r + 13} className="node-hint" style={{ fill: hintColor, stroke: hintColor }} />}
              <circle cx={n.x} cy={n.y} r={r} className="node-circle" />
              {(big || n.junction) && <circle cx={n.x} cy={n.y} r={r - 7} className="node-inner" />}
              {n.kind === 'special' && <path d={`M${n.x - 14} ${n.y + 9} L${n.x - 5} ${n.y - 8} L${n.x} ${n.y - 1} L${n.x + 6} ${n.y - 11} L${n.x + 15} ${n.y + 9} Z`} className="mountain" />}
              <text {...labelProps(n, r, lines.length)} className={`node-label ${n.kind === 'city' ? 'city' : ''}`}>
                {lines.map((t, i) => <tspan key={i} x={labelProps(n, r, lines.length).x} dy={i === 0 ? 0 : LINE_H}>{t}</tspan>)}
              </text>
              {badge && (
                <g className={`node-badge ${badge.cls}`}>
                  <circle cx={n.x + r * 0.8} cy={n.y - r * 0.8} r="11" />
                  <text x={n.x + r * 0.8} y={n.y - r * 0.8 + 6} textAnchor="middle">{badge.text}</text>
                </g>
              )}
              {hint && (
                <text x={n.x} y={n.y + 8} textAnchor="middle" className="hint-text" style={{ fill: hintColor }}>{hint.join('·')}</text>
              )}
              {n.junction && <text x={n.x} y={n.y + r + 18} textAnchor="middle" className="port-label">갈림길</text>}
              {n.kind === 'start' && <text x={n.x} y={n.y + 74} textAnchor="middle" className="start-label">출발</text>}
              {n.kind === 'finish' && <text x={n.x} y={n.y + 8} textAnchor="middle" className="start-label">도착</text>}
            </g>
          )
        })}
      </svg>

      {/* 말 */}
      {onBoard.map((p) => {
        const L = layout[p.id]
        const team = teams[p.teamId]
        const node = NODES[p.pos]
        const arrived = fx.arrived.includes(p.id)
        return (
          <div
            key={p.id}
            className={`piece ${flyingIds.includes(p.id) ? 'is-flying' : ''}`}
            style={{ ...pct(L.x, node.y), zIndex: L.z, '--lift': `${-L.lift}px` }}
          >
            <div key={arrived ? fx.seq : 'still'} className={arrived ? 'hop' : ''}>
              <Token
                team={team}
                size={tok}
                count={L.isTop ? L.count : 0}
                resting={L.isTop && rest[p.teamId]}
                selected={selectedIds.includes(p.id)}
                dim={dragPieceId && selectedIds.includes(p.id)}
                {...pieceHandlers(p.id)}
              />
            </div>
          </div>
        )
      })}

      {/* 잡힌 말이 쫓겨나는 연출 */}
      {fx.captures && (
        <div key={`cap-${fx.seq}`} className="capture-fx" style={pct(NODES[fx.captures.nodeId].x, NODES[fx.captures.nodeId].y)}>
          {fx.captures.pieces.map((c, i) => (
            <div key={c.id} className="kicked" style={{ '--dx': `${(i % 2 ? 1 : -1) * (60 + i * 20)}px` }}>
              <Token team={teams[c.teamId]} size={tok} />
            </div>
          ))}
          <div className="capture-text">잡았다!</div>
        </div>
      )}

      {flight && <Flight key={flight.seq} {...flight} pct={pct} />}

      {admin && <div className="admin-banner">자유 배치 모드 · 잡기, 업기, 이벤트 없이 말을 하나씩 옮겨요</div>}
    </div>
  )
}
