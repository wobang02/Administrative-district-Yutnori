// 윷판 데이터: 부산에서 출발해 나선특별시에 먼저 도착하면 이기는 편도 길
// 칸 = 한반도 1급 행정구역(도·특별시·광역시) 28곳 + 울릉도·독도 + 금강산국제관광특구 = 31칸
// 좌표는 지도 SVG(가로 800 × 세로 1250) 안의 위치이고, 각 칸은 자기 행정구역 경계선 안에 있습니다.
//
// name   : 정식 명칭 (지도에 작은 글씨로 표시)   lines: 이름이 길 때 두 줄로 나눠 표시
// short  : 줄인 이름 (룰렛, 안내 문구에 사용)
// next   : 다음 칸. 두 개면 갈림길 → 이 칸에 "멈춘" 말은 둘 중 하나를 고를 수 있고,
//          그냥 지나가는 말은 첫 번째 길로 갑니다.
// kind   : 'start' | 'finish' | 'hub'(큰 칸) | 'city'(특별시·광역시, 작은 칸) | 'island'
// anchor : 칸이 너무 붙어 옆으로 비켜 그린 경우 실제 위치 [x, y] (가는 선으로 이어 줌)
// label  : 이름표 위치 ('below' 기본, 'above' | 'left' | 'right')

export const VIEW_W = 800
export const VIEW_H = 1250

export const NODES = [
  { id: 0, name: '부산광역시', short: '부산', x: 521, y: 1043, kind: 'start', next: [1, 17], label: 'below' },
  // ── 서해안 길: 경남 → 제주 → 전남 → 광주 → 전북 → 충남 → 인천 → (북쪽 서해안) → 나선
  { id: 1, name: '경상남도', short: '경남', x: 436, y: 1017, next: [2], label: 'above' },
  { id: 2, name: '제주특별자치도', short: '제주', x: 257, y: 1210, next: [3], event: 'jeju', label: 'right' },
  { id: 3, name: '전라남도', short: '전남', x: 250, y: 1088, next: [4], label: 'left' },
  { id: 4, name: '광주광역시', short: '광주', x: 295, y: 1036, kind: 'city', next: [5], event: 'quiz', label: 'right' },
  { id: 5, name: '전북특별자치도', short: '전북', x: 310, y: 965, next: [6], label: 'left' },
  { id: 6, name: '충청남도', short: '충남', x: 262, y: 890, next: [7], label: 'left' },
  { id: 7, name: '인천광역시', short: '인천', x: 234, y: 748, kind: 'city', junction: true, anchor: [270, 741], next: [8, 24], event: 'quiz', label: 'left' },
  { id: 8, name: '황해남도', short: '황남', x: 131, y: 652, next: [9], label: 'below' },
  { id: 9, name: '황해북도', short: '황북', x: 173, y: 588, next: [10], label: 'left' },
  { id: 10, name: '평양직할시', short: '평양', x: 194, y: 535, kind: 'city', next: [11], event: 'quiz', label: 'right' },
  { id: 11, name: '평안남도', short: '평남', x: 207, y: 466, next: [12], label: 'right' },
  { id: 12, name: '평안북도', short: '평북', x: 92, y: 394, next: [13], label: 'below' },
  { id: 13, name: '자강도', short: '자강', x: 257, y: 308, next: [14], label: 'above' },
  { id: 14, name: '양강도', short: '양강', x: 430, y: 243, next: [15], event: 'quiz', label: 'below' },
  { id: 15, name: '함경북도', short: '함북', x: 562, y: 197, next: [16], label: 'right' },
  { id: 16, name: '나선특별시', short: '나선', x: 667, y: 96, kind: 'finish', next: [], label: 'left' },
  // ── 동쪽·내륙 길: 울산 → 대구 → 경북 → 충북 → 대전 → 세종 → 경기 → 서울 → 강원 → (금강산) → 나선
  { id: 17, name: '울산광역시', short: '울산', x: 545, y: 990, kind: 'city', next: [18], label: 'right' },
  { id: 18, name: '대구광역시', short: '대구', x: 475, y: 948, kind: 'city', next: [19], event: 'quiz', label: 'left' },
  { id: 19, name: '경상북도', short: '경북', x: 488, y: 860, next: [20], label: 'right' },
  { id: 20, name: '충청북도', short: '충북', x: 386, y: 820, next: [21], label: 'right' },
  { id: 21, name: '대전광역시', short: '대전', x: 347, y: 885, kind: 'city', next: [22], label: 'right' },
  { id: 22, name: '세종특별자치시', short: '세종', x: 318, y: 838, kind: 'city', anchor: [330, 862], next: [23], event: 'sejong', label: 'left', lines: ['세종', '특별자치시'] },
  { id: 23, name: '경기도', short: '경기', x: 276, y: 790, next: [24], label: 'left' },
  { id: 24, name: '서울특별시', short: '서울', x: 304, y: 728, kind: 'hub', next: [25], label: 'above' },
  { id: 25, name: '강원특별자치도', short: '강원', x: 388, y: 689, junction: true, next: [26, 29], label: 'right', lines: ['강원', '특별자치도'] },
  { id: 26, name: '금강산국제관광특구', short: '금강산', x: 428, y: 588, kind: 'special', next: [27], event: 'kumgang', label: 'right', lines: ['금강산', '국제관광특구'] },
  { id: 27, name: '강원도(북한)', short: '강원(북)', x: 322, y: 548, next: [28], label: 'below' },
  { id: 28, name: '함경남도', short: '함남', x: 362, y: 413, next: [15], label: 'left' },
  // ── 뱃길: 강원에 멈추면 울릉도 → 독도 → 함남으로 갈 수도 있어요 (금강산 길과 길이가 같음)
  { id: 29, name: '울릉도', short: '울릉도', x: 711, y: 734, kind: 'island', next: [30], label: 'above' },
  { id: 30, name: '독도', short: '독도', x: 768, y: 764, kind: 'island', next: [28], event: 'quiz', label: 'below' },
]

export const START_NODE = 0
export const FINISH_NODE = 16

// next 목록으로부터 길(선)을 만듭니다. 바다를 건너는 길은 점선(sea)
const SEA = new Set(['1-2', '2-3', '25-29', '29-30', '30-28'])
export const EDGES = NODES.flatMap((n) => n.next.map((b) => ({ a: n.id, b, sea: SEA.has(`${n.id}-${b}`) })))

// 세종 출장 룰렛에 나오는 행정구역 (윷판 칸의 short 이름과 같아야 합니다)
// 남한 17개 시·도 + 북한 10개 도·직할시. 도착점인 나선은 바로 우승이 되므로 뺐어요.
export const REGIONS_SOUTH = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]
export const REGIONS_NORTH = [
  '평양', '평남', '평북', '자강', '양강', '함남', '함북', '황남', '황북', '강원(북)',
]
export const ROULETTE_REGIONS = [...REGIONS_SOUTH, ...REGIONS_NORTH]

export const nodeByName = (name) => NODES.find((n) => n.short === name || n.name === name)

export const EVENT_INFO = {
  jeju: { title: '제주', desc: '풍랑주의보(1회 쉬기) 또는 비행기 타고 서울로' },
  sejong: { title: '세종', desc: '긴급 출장 명령 룰렛으로 남북한 어디든 순간 이동' },
  quiz: { title: '퀴즈 칸', desc: '행정구역 퀴즈! 맞히면 보상 룰렛을 돌려요 (좋은 칸·나쁜 칸이 섞여 있어요)' },
  kumgang: { title: '금강산국제관광특구', desc: '일만 이천 봉 구경! 윷을 한 번 더 던져요' },
  junction: { title: '갈림길 (인천, 강원)', desc: '갈림길에 딱 멈추면 다음에 갈 길을 고를 수 있어요' },
}
