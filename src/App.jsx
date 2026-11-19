// 앱 전체를 묶는 최상위 컴포넌트
// - 게임 상태: useReducer(game/reducer.js)
// - 화면에만 필요한 상태(선택한 말, 비행 연출, 꽃가루 등): useState
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { reducer, initialState, groupOf } from './game/reducer.js'
import { NODES, EVENT_INFO, nodeByName, FINISH_NODE } from './data/board.js'
import { sfx, setMuted } from './game/sound.js'
import { useDrag } from './game/useDrag.js'
import { STEPS, allTargets } from './game/paths.js'
import { i_ga, ro } from './game/korean.js'
import SetupScreen from './components/SetupScreen.jsx'
import Board from './components/Board.jsx'
import Scoreboard from './components/Scoreboard.jsx'
import TeacherPanel from './components/TeacherPanel.jsx'
import Roulette from './components/Roulette.jsx'
import Token from './components/Token.jsx'
import Confetti from './components/Confetti.jsx'
import { JejuModal, QuizModal, KumgangModal, ConfirmReset, WinModal } from './components/EventModals.jsx'

const SAVE_KEY = 'yut-tour-save-v3'

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [selectedId, setSelectedId] = useState(null)
  const [flight, setFlight] = useState(null)
  const [flyingIds, setFlyingIds] = useState([])
  const [confetti, setConfetti] = useState(0)
  const [muted, setMutedState] = useState(false)
  const [askReset, setAskReset] = useState(false)
  const [saved, setSaved] = useState(loadSaved)
  const [noticeVisible, setNoticeVisible] = useState(false)
  const boardRef = useRef(null)

  const { teams, pieces, phase, pending, admin } = state
  const selectedPiece = pieces.find((p) => p.id === selectedId) || null
  const selectedIds = selectedPiece ? (admin ? [selectedPiece.id] : groupOf(pieces, selectedPiece)) : []

  // ── 고른 말이 빽도~모로 갈 수 있는 칸 (자유 배치 모드에서는 계산하지 않음)
  const targets = selectedPiece && !admin ? allTargets(selectedPiece.pos) : null
  let hints = null
  if (targets) {
    hints = { nodes: {}, goal: [] }
    STEPS.forEach((st) => targets[st.key].forEach((t) => {
      if (t === 'goal') { hints.goal.push(st.name); (hints.nodes[FINISH_NODE] = hints.nodes[FINISH_NODE] || []).push(st.name) }
      else (hints.nodes[t] = hints.nodes[t] || []).push(st.name)
    }))
  }

  // ── 자동 저장 (새로고침해도 이어하기 가능, 이 컴퓨터 브라우저에만 저장)
  useEffect(() => {
    if (phase !== 'play') return
    try {
      const { teams, pieces, turn, rest, quiz, pieceCount, history } = state
      localStorage.setItem(SAVE_KEY, JSON.stringify({ phase, teams, pieces, turn, rest, quiz, pieceCount, history: history.slice(-30) }))
    } catch { /* 저장 공간을 못 쓰는 환경이면 조용히 넘어갑니다 */ }
  }, [state, phase])

  // ── 이동 효과음
  const lastFx = useRef(0)
  useEffect(() => {
    if (state.fx.seq === lastFx.current) return
    lastFx.current = state.fx.seq
    if (state.fx.captures) sfx.capture()
    else if (state.fx.arrived.length) sfx.move()
  }, [state.fx])

  // ── 이벤트 팝업 등장음
  useEffect(() => { if (pending) setTimeout(sfx.event, 350) }, [pending])

  // ── 우승
  useEffect(() => {
    if (state.winner !== null) { sfx.win(); setConfetti((c) => c + 1) }
  }, [state.winner])

  // ── 안내 문구 잠깐 보여주기
  useEffect(() => {
    if (!state.notice) return
    setNoticeVisible(true)
    const t = setTimeout(() => setNoticeVisible(false), 2600)
    return () => clearTimeout(t)
  }, [state.notice])

  const move = useCallback((pieceId, to) => {
    dispatch({ type: 'MOVE', pieceId, to, jejuRoll: Math.random() < 0.5 ? 'rest' : 'plane' })
    setSelectedId(null)
  }, [])

  const undo = useCallback(() => {
    if (!state.history.length) return
    sfx.undo()
    setFlight(null)
    setFlyingIds([])
    setSelectedId(null)
    dispatch({ type: 'UNDO' })
  }, [state.history.length])

  // ── 키보드: Ctrl+Z 되돌리기, Esc 선택 취소
  useEffect(() => {
    const onKey = (e) => {
      if (phase !== 'play') return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo() }
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, undo])

  // ── 말 누르기: 선택 → 다른 칸의 말을 누르면 그 칸으로 이동(업기/잡기)
  const onTapPiece = (pieceId) => {
    const p = pieces.find((x) => x.id === pieceId)
    if (!p) return
    if (selectedPiece && typeof p.pos === 'number' && p.pos !== selectedPiece.pos) return move(selectedPiece.id, p.pos)
    if (selectedIds.includes(pieceId)) return setSelectedId(null)
    sfx.select()
    setSelectedId(pieceId)
  }

  const { drag, handlers } = useDrag({
    boardRef,
    onTap: onTapPiece,
    onDrop: (pieceId, target) => move(pieceId, target === 'goal' || target === 'home' ? target : Number(target)),
  })

  const onNodeClick = (nodeId) => { if (selectedPiece) move(selectedPiece.id, nodeId) }

  // ── 비행(헬리콥터/비행기) 연출 + 순간 이동
  const fly = (pieceIds, from, to, kind) => {
    sfx.flight()
    setFlight({ seq: Date.now(), from, to, kind })
    setFlyingIds(pieceIds)
    setTimeout(() => dispatch({ type: 'TELEPORT', pieceIds, to }), 60)
    setTimeout(() => { setFlight(null); setFlyingIds([]) }, 1700)
  }

  const startGame = (names, pieceCount) => { setSelectedId(null); dispatch({ type: 'START', names, pieceCount }) }

  if (phase === 'setup') {
    return (
      <SetupScreen
        onStart={startGame}
        savedGame={saved}
        onResume={() => dispatch({ type: 'LOAD', saved })}
      />
    )
  }

  const pendingTeam = pending ? teams[pending.teamId] : null
  const dragTeam = drag ? teams[pieces.find((p) => p.id === drag.pieceId)?.teamId] : null
  const currentTeam = teams[state.turn]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>행정구역 윷놀이판</h1>
          <span className="turn-now" style={{ '--team': currentTeam.color }}>
            지금은 <b>{currentTeam.name}</b> 차례
          </span>
        </div>
        <TeacherPanel
          canUndo={state.history.length > 0}
          undoCount={state.history.length}
          admin={admin}
          muted={muted}
          onUndo={undo}
          onNextTurn={() => { setSelectedId(null); dispatch({ type: 'NEXT_TURN' }) }}
          onToggleAdmin={() => { setSelectedId(null); dispatch({ type: 'TOGGLE_ADMIN' }) }}
          onToggleMute={() => { setMuted(!muted); setMutedState(!muted) }}
          onReset={() => setAskReset(true)}
        />
      </header>

      <main className="stage">
        <aside className="side side-left">
          {selectedPiece ? (
            <div className="selection-card" style={{ '--team': teams[selectedPiece.teamId].color }}>
              <p className="sel-title">
                <b>{teams[selectedPiece.teamId].name}</b> 말 {selectedIds.length}개 선택
              </p>
              <p className="sel-where">
                {typeof selectedPiece.pos === 'number' ? `지금 위치: ${NODES[selectedPiece.pos].short}` : '대기 중인 말'}
              </p>
              {targets ? (
                <>
                  <p className="sel-hint">윷 결과를 누르거나 갈 칸을 눌러요</p>
                  <div className="step-grid">
                    {STEPS.map((st) => {
                      const list = targets[st.key]
                      const where = list.length === 0 ? '없음' : list.length > 1 ? '갈림길' : list[0] === 'goal' ? '도착' : NODES[list[0]].short
                      return (
                        <button
                          key={st.key}
                          className={`step-btn ${st.key === 'back' ? 'is-back' : ''}`}
                          disabled={list.length === 0}
                          onClick={() => {
                            if (list.length === 1) move(selectedPiece.id, list[0])
                            else dispatch({ type: 'NOTICE', text: `${st.name}: 갈 수 있는 길이 두 개예요. 지도에서 칸을 골라 주세요` })
                          }}
                        >
                          <b>{st.name}</b>
                          <span>{where}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="sel-hint">갈 칸을 눌러 주세요</p>
              )}
              <div className="sel-actions">
                <button className="btn-primary" onClick={() => move(selectedPiece.id, 'goal')}>도착 처리</button>
                {selectedPiece.pos !== 'home' && <button className="btn-secondary" onClick={() => move(selectedPiece.id, 'home')}>대기로 되돌리기</button>}
                <button className="btn-ghost" onClick={() => setSelectedId(null)}>선택 취소</button>
              </div>
            </div>
          ) : (
            <div className="selection-card empty">
              <p className="sel-hint">말을 눌러서 골라 주세요</p>
              <p className="sel-sub">대기 중인 말은 오른쪽 점수판에 있어요.</p>
            </div>
          )}
          <details className="help" open>
            <summary>도움말</summary>
          <h2>이렇게 움직여요</h2>
          <ol className="howto">
            <li>윷을 던진 뒤 옮길 <b>말을 누르고</b></li>
            <li>도착할 <b>칸을 누르거나</b> 말을 끌어다 놓아요</li>
            <li>부산에서 출발해 <b>나선특별시</b>에 먼저 모든 말이 도착하면 우승!</li>
          </ol>
          <h2>특별한 칸</h2>
          <ul className="legend">
            <li><span className="lg-badge badge-jeju">!</span><div><b>{EVENT_INFO.jeju.title}</b><span>{EVENT_INFO.jeju.desc}</span></div></li>
            <li><span className="lg-badge badge-sejong">!</span><div><b>{EVENT_INFO.sejong.title}</b><span>{EVENT_INFO.sejong.desc}</span></div></li>
            <li><span className="lg-badge badge-quiz">?</span><div><b>{EVENT_INFO.quiz.title}</b><span>{EVENT_INFO.quiz.desc}</span></div></li>
            <li><span className="lg-badge badge-kumgang">산</span><div><b>{EVENT_INFO.kumgang.title}</b><span>{EVENT_INFO.kumgang.desc}</span></div></li>
            <li><span className="lg-badge badge-jeju">갈</span><div><b>{EVENT_INFO.junction.title}</b><span>{EVENT_INFO.junction.desc}</span></div></li>
          </ul>
          <p className="legend-note">길 위의 <b>화살표</b> 방향으로 움직여요. 서해안 길과 동쪽 길 중 어느 쪽으로 가도 돼요. 강원에서 고르는 뱃길(울릉도·독도)은 금강산 길과 길이가 같아요. 작은 칸은 특별시·광역시예요.</p>
          </details>
        </aside>

        <div className="board-area">
          <Board
            boardRef={boardRef}
            teams={teams}
            pieces={pieces}
            rest={state.rest}
            selectedIds={selectedIds}
            admin={admin}
            fx={state.fx}
            flight={flight}
            flyingIds={flyingIds}
            dragPieceId={drag?.pieceId}
            dragOverNode={drag?.over === undefined ? null : drag.over === 'goal' || drag.over === 'home' ? drag.over : Number(drag.over)}
            hints={hints}
            hintColor={selectedPiece ? teams[selectedPiece.teamId].color : undefined}
            onNodeClick={onNodeClick}
            onGoalClick={() => selectedPiece && move(selectedPiece.id, 'goal')}
            pieceHandlers={handlers}
          />
        </div>

        <aside className="side side-right">
        <Scoreboard
          teams={teams}
          pieces={pieces}
          turn={state.turn}
          rest={state.rest}
          quiz={state.quiz}
          selectedIds={selectedIds}
          pieceHandlers={handlers}
          dragOverNode={drag?.over}
          onSetTurn={(t) => dispatch({ type: 'SET_TURN', turn: t })}
          onClearRest={(t) => dispatch({ type: 'CLEAR_REST', teamId: t })}
        />
        </aside>
      </main>

      {/* 끌고 있는 말 */}
      {drag && dragTeam && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
          <Token team={dragTeam} size={60} />
        </div>
      )}

      {/* 이벤트 팝업 (말 이동 애니메이션이 끝난 뒤 나타나도록 살짝 지연) */}
      {pending?.type === 'quiz' && (
        <div className="delayed">
          <QuizModal
            team={pendingTeam}
            nodeName={NODES[pending.nodeId].short}
            onCorrect={() => { sfx.correct(); setConfetti((c) => c + 1); dispatch({ type: 'QUIZ_CORRECT', teamId: pending.teamId }) }}
            onWrong={() => { sfx.wrong(); dispatch({ type: 'CLOSE_EVENT' }) }}
          />
        </div>
      )}
      {pending?.type === 'kumgang' && (
        <div className="delayed">
          <KumgangModal team={pendingTeam} onConfirm={() => { sfx.correct(); dispatch({ type: 'CLOSE_EVENT' }) }} />
        </div>
      )}
      {pending?.type === 'jeju' && (
        <div className="delayed">
          <JejuModal
            team={pendingTeam}
            outcome={pending.outcome}
            onConfirm={() => {
              if (pending.outcome === 'rest') dispatch({ type: 'JEJU_REST', teamId: pending.teamId })
              else { dispatch({ type: 'CLOSE_EVENT' }); fly(pending.pieceIds, pending.nodeId, nodeByName('서울').id, 'plane') }
            }}
          />
        </div>
      )}
      {pending?.type === 'sejong' && (
        <div className="delayed">
          <Roulette
            team={pendingTeam}
            onDone={(region) => {
              dispatch({ type: 'CLOSE_EVENT' })
              const target = nodeByName(region)
              if (!target || target.id === pending.nodeId) return
              dispatch({ type: 'NOTICE', text: `${i_ga(pendingTeam.name)} 헬리콥터를 타고 ${ro(region)} 출장 가요` })
              fly(pending.pieceIds, pending.nodeId, target.id, 'heli')
            }}
          />
        </div>
      )}

      {state.winner !== null && <WinModal team={teams[state.winner]} onClose={() => dispatch({ type: 'DISMISS_WINNER' })} />}

      {askReset && (
        <ConfirmReset
          onRestart={() => { setAskReset(false); setSelectedId(null); dispatch({ type: 'RESTART' }) }}
          onSetup={() => {
            setAskReset(false)
            setSelectedId(null)
            try { localStorage.removeItem(SAVE_KEY) } catch { /* 무시 */ }
            setSaved(null)
            dispatch({ type: 'TO_SETUP' })
          }}
          onCancel={() => setAskReset(false)}
        />
      )}

      {confetti > 0 && <Confetti key={confetti} />}
      {state.notice && <div key={state.notice.seq} className={`notice ${noticeVisible ? 'is-on' : ''}`}>{state.notice.text}</div>}
    </div>
  )
}
