// 효과음: 음원 파일 없이 Web Audio API로 그 자리에서 소리를 "합성"합니다. (저작권 걱정 없음)
let ctx = null
let muted = false

export const setMuted = (m) => { muted = m }

function audio() {
  if (muted) return null
  try {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext
      if (!C) return null
      ctx = new C()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq, dur, { type = 'sine', vol = 0.18, delay = 0, slideTo } = {}) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export const sfx = {
  select: () => tone(660, 0.07, { type: 'triangle', vol: 0.12 }),
  move: () => { tone(440, 0.09, { type: 'triangle' }); tone(660, 0.12, { type: 'triangle', delay: 0.08 }) },
  capture: () => { tone(700, 0.45, { type: 'sawtooth', vol: 0.12, slideTo: 110 }); tone(220, 0.2, { type: 'square', vol: 0.08, delay: 0.35 }) },
  event: () => [523, 659, 784].forEach((f, i) => tone(f, 0.14, { type: 'triangle', delay: i * 0.09 })),
  tick: () => tone(1400, 0.03, { type: 'square', vol: 0.05 }),
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.45 : 0.15, { type: 'triangle', vol: 0.2, delay: i * 0.12 })),
  wrong: () => { tone(330, 0.2, { type: 'sine' }); tone(262, 0.35, { type: 'sine', delay: 0.18 }) },
  flight: () => { for (let i = 0; i < 14; i++) tone(90, 0.06, { type: 'square', vol: 0.06, delay: i * 0.09 }) },
  undo: () => tone(500, 0.15, { type: 'sine', slideTo: 300 }),
  win: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.22, delay: i * 0.16 })),
}
