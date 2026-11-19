// 윷 결과(빽도·도·개·걸·윷·모)에 따라 말이 갈 수 있는 칸을 계산합니다.
//
// 규칙
//  - 대기 중인 말은 부산에서 출발합니다. (도 = 부산 다음 칸)
//  - 갈림길에 "멈춰 있던" 말은 다음에 두 길 중 하나를 고를 수 있습니다. (둘 다 표시)
//  - 갈림길을 그냥 지나가는 말은 첫 번째 길(next[0])로 갑니다.
//  - 나선특별시에 닿거나 넘어가면 도착(골인)입니다.
//  - 빽도는 한 칸 뒤로. 들어오는 길이 여러 개면 모두 표시합니다.
import { NODES, START_NODE, FINISH_NODE } from '../data/board.js'

export const STEPS = [
  { key: 'back', name: '빽도', n: -1 },
  { key: 'do', name: '도', n: 1 },
  { key: 'gae', name: '개', n: 2 },
  { key: 'geol', name: '걸', n: 3 },
  { key: 'yut', name: '윷', n: 4 },
  { key: 'mo', name: '모', n: 5 },
]

const NEXT = Object.fromEntries(NODES.map((n) => [n.id, n.next]))
const PRED = {}
NODES.forEach((n) => n.next.forEach((b) => { (PRED[b] = PRED[b] || []).push(n.id) }))

const passNext = (cur) => (cur === 'goal' || cur === FINISH_NODE ? 'goal' : NEXT[cur][0])

export function targetsFor(pos, n) {
  if (pos === 'goal') return []
  if (n === -1) return typeof pos === 'number' ? PRED[pos] || [] : []
  const from = pos === 'home' ? START_NODE : pos
  if (from === FINISH_NODE) return ['goal']
  let ends = [...NEXT[from]]
  for (let k = 1; k < n; k++) ends = ends.map(passNext)
  return [...new Set(ends.map((e) => (e === FINISH_NODE ? 'goal' : e)))]
}

export function allTargets(pos) {
  return Object.fromEntries(STEPS.map((s) => [s.key, targetsFor(pos, s.n)]))
}
