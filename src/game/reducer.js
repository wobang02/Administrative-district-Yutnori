// 게임의 모든 상태 변화는 이 파일 한 곳에서 일어납니다. (useReducer)
// 말을 옮기기 "직전" 상태를 history 배열에 쌓아 두었다가, 되돌리기를 누르면 하나씩 꺼내 복원합니다.
import { eun } from './korean.js'
import { NODES, FINISH_NODE } from '../data/board.js'
import { TEAM_PRESETS } from '../data/teams.js'

const MAX_HISTORY = 100

export const initialState = {
  phase: 'setup', // 'setup' | 'play'
  teams: [],
  pieces: [], // { id, teamId, pos: 'home' | 'goal' | 노드번호 }
  turn: 0,
  rest: {}, // { [teamId]: true }  제주 풍랑주의보로 1회 쉬기
  quiz: {}, // { [teamId]: 점수 }
  admin: false, // 자유 배치 모드
  history: [],
  pending: null, // 진행 중인 지역 이벤트 { type, teamId, pieceIds, nodeId, outcome }
  fx: { seq: 0, arrived: [], captures: null },
  winner: null,
  notice: null, // { seq, text } 화면 위쪽에 잠깐 뜨는 안내
}

const snapshot = (s) => ({ pieces: s.pieces, rest: s.rest, quiz: s.quiz })
const withHistory = (s) => [...s.history, snapshot(s)].slice(-MAX_HISTORY)
const isOnBoard = (pos) => typeof pos === 'number'

function findWinner(teams, pieces) {
  return teams.find((t) => pieces.filter((p) => p.teamId === t.id).every((p) => p.pos === 'goal'))?.id ?? null
}

// 말들을 to 로 옮기고, 잡기(capture)가 있으면 처리한 결과를 돌려줍니다.
function relocate(pieces, ids, to, teamId, allowCapture) {
  let next = pieces.map((p) => (ids.includes(p.id) ? { ...p, pos: to } : p))
  let captured = []
  if (allowCapture && isOnBoard(to)) {
    captured = next.filter((p) => p.pos === to && p.teamId !== teamId)
    const capIds = captured.map((p) => p.id)
    next = next.map((p) => (capIds.includes(p.id) ? { ...p, pos: 'home' } : p))
  }
  return { pieces: next, captured }
}

function afterMove(s, { pieces, captured }, ids, to, extra = {}) {
  const prevWinner = findWinner(s.teams, s.pieces)
  const winner = findWinner(s.teams, pieces)
  return {
    ...s,
    history: withHistory(s),
    pieces,
    fx: {
      seq: s.fx.seq + 1,
      arrived: ids,
      captures: captured.length ? { nodeId: to, pieces: captured.map(({ id, teamId }) => ({ id, teamId })) } : null,
    },
    winner: winner !== null && prevWinner === null ? winner : s.winner,
    ...extra,
  }
}

// 같은 칸에 있는 같은 팀 말 = 업힌 그룹
export function groupOf(pieces, piece) {
  if (!isOnBoard(piece.pos)) return [piece.id]
  return pieces.filter((p) => p.teamId === piece.teamId && p.pos === piece.pos).map((p) => p.id)
}

export function reducer(s, a) {
  switch (a.type) {
    case 'START': {
      const teams = a.names.map((name, i) => ({ id: i, name, ...TEAM_PRESETS[i] }))
      const pieces = teams.flatMap((t) =>
        Array.from({ length: a.pieceCount }, (_, k) => ({ id: `${t.id}-${k}`, teamId: t.id, pos: 'home' })),
      )
      return { ...initialState, phase: 'play', teams, pieces, pieceCount: a.pieceCount }
    }

    case 'LOAD':
      return { ...initialState, ...a.saved, pending: null, winner: null, fx: initialState.fx }

    case 'MOVE': {
      if (a.to === FINISH_NODE) return reducer(s, { ...a, to: 'goal' }) // 나선 도착 = 골인
      const piece = s.pieces.find((p) => p.id === a.pieceId)
      if (!piece || piece.pos === a.to) return s
      // 자유 배치 모드에서는 말 하나만, 보통 때는 업힌 말 전체가 함께 움직입니다.
      const ids = s.admin ? [piece.id] : groupOf(s.pieces, piece)
      const result = relocate(s.pieces, ids, a.to, piece.teamId, !s.admin)
      const event = !s.admin && isOnBoard(a.to) ? NODES[a.to].event : null
      const pending = event
        ? { type: event, teamId: piece.teamId, pieceIds: ids, nodeId: a.to, outcome: a.jejuRoll }
        : null
      return afterMove(s, result, ids, a.to, { pending })
    }

    case 'TELEPORT': {
      if (a.to === FINISH_NODE) return reducer(s, { ...a, to: 'goal' })
      // 세종 출장 · 제주 비행기: 이동 + 잡기 판정 (도착지 이벤트는 다시 일어나지 않음)
      const teamId = s.pieces.find((p) => p.id === a.pieceIds[0])?.teamId
      const result = relocate(s.pieces, a.pieceIds, a.to, teamId, true)
      return afterMove(s, result, a.pieceIds, a.to, { pending: null })
    }

    case 'JEJU_REST':
      return { ...s, history: withHistory(s), rest: { ...s.rest, [a.teamId]: true }, pending: null }

    case 'CLEAR_REST': {
      const rest = { ...s.rest }
      delete rest[a.teamId]
      return { ...s, history: withHistory(s), rest }
    }

    case 'QUIZ_CORRECT':
      return {
        ...s,
        history: withHistory(s),
        quiz: { ...s.quiz, [a.teamId]: (s.quiz[a.teamId] || 0) + 1 },
        pending: null,
      }

    case 'TO_BONUS': // 퀴즈 정답 → 보상 룰렛으로
      return s.pending ? { ...s, pending: { ...s.pending, type: 'bonus' } } : s

    case 'PIGGYBACK': { // 대기 중인 같은 팀 말 하나를 nodeId 로 올려 업기
      const p = s.pieces.find((x) => x.teamId === a.teamId && x.pos === 'home')
      if (!p) return { ...s, pending: null, notice: { seq: (s.notice?.seq || 0) + 1, text: '업을 대기 말이 없어요' } }
      return afterMove(s, { pieces: s.pieces.map((x) => (x.id === p.id ? { ...x, pos: a.nodeId } : x)), captured: [] }, [p.id], a.nodeId, { pending: null })
    }

    case 'SWAP': { // 내 말(업힌 말 포함)과 상대 말의 자리를 서로 바꾸기
      const mine = s.pieces.find((x) => x.id === a.pieceIds[0])
      if (!mine || typeof mine.pos !== 'number') return s
      const myPos = mine.pos
      const otherIds = s.pieces.filter((x) => x.pos === a.targetPos && x.teamId !== mine.teamId).map((x) => x.id)
      const pieces = s.pieces.map((x) =>
        a.pieceIds.includes(x.id) ? { ...x, pos: a.targetPos } : otherIds.includes(x.id) ? { ...x, pos: myPos } : x)
      return afterMove(s, { pieces, captured: [] }, [...a.pieceIds, ...otherIds], a.targetPos, { pending: null })
    }

    case 'CLOSE_EVENT':
      return { ...s, pending: null }

    case 'UNDO': {
      if (!s.history.length) return s
      const last = s.history[s.history.length - 1]
      return {
        ...s,
        ...last,
        history: s.history.slice(0, -1),
        pending: null,
        winner: null,
        fx: { seq: s.fx.seq + 1, arrived: [], captures: null },
        notice: { seq: (s.notice?.seq || 0) + 1, text: '한 단계 되돌렸어요' },
      }
    }

    case 'NEXT_TURN': {
      const n = s.teams.length
      let next = (s.turn + 1) % n
      const rest = { ...s.rest }
      let text = null
      if (rest[next]) {
        text = `${eun(s.teams[next].name)} 풍랑주의보로 이번 차례를 쉬어요`
        delete rest[next]
        next = (next + 1) % n
      }
      return {
        ...s,
        turn: next,
        rest,
        notice: text ? { seq: (s.notice?.seq || 0) + 1, text } : s.notice,
      }
    }

    case 'SET_TURN':
      return { ...s, turn: a.turn }

    case 'TOGGLE_ADMIN':
      return { ...s, admin: !s.admin }

    case 'DISMISS_WINNER':
      return { ...s, winner: null }

    case 'NOTICE':
      return { ...s, notice: { seq: (s.notice?.seq || 0) + 1, text: a.text } }

    case 'RESTART': // 같은 모둠으로 처음부터
      return reducer(s, { type: 'START', names: s.teams.map((t) => t.name), pieceCount: s.pieceCount })

    case 'TO_SETUP':
      return { ...initialState }

    default:
      return s
  }
}
