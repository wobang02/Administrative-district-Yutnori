// 받침에 따라 '로/으로', '은/는' 등을 골라 붙여 줍니다.
const hasBatchim = (word) => {
  const c = word.charCodeAt(word.length - 1) - 0xac00
  if (c < 0 || c > 11171) return false
  return c % 28 !== 0
}
const isRieul = (word) => (word.charCodeAt(word.length - 1) - 0xac00) % 28 === 8

export const ro = (w) => w + (hasBatchim(w) && !isRieul(w) ? '으로' : '로')
export const eun = (w) => w + (hasBatchim(w) ? '은' : '는')
export const i_ga = (w) => w + (hasBatchim(w) ? '이' : '가')
