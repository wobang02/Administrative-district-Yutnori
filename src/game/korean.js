// 받침에 따라 '로/으로', '은/는' 등을 골라 붙여 줍니다.
// 괄호 등은 건너뛰고 마지막 한글 글자로 판단해요. 예: '강원(북)' → '북'
const lastCode = (word) => {
  for (let i = word.length - 1; i >= 0; i--) {
    const c = word.charCodeAt(i) - 0xac00
    if (c >= 0 && c <= 11171) return c
  }
  return -1
}
const hasBatchim = (word) => { const c = lastCode(word); return c >= 0 && c % 28 !== 0 }
const isRieul = (word) => lastCode(word) % 28 === 8

export const ro = (w) => w + (hasBatchim(w) && !isRieul(w) ? '으로' : '로')
export const eun = (w) => w + (hasBatchim(w) ? '은' : '는')
export const i_ga = (w) => w + (hasBatchim(w) ? '이' : '가')
