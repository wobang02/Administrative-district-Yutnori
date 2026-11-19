// 정답·우승 축하 꽃가루 (CSS 애니메이션)
const COLORS = ['#e5484d', '#2f6fde', '#e7a600', '#1f9d63', '#8b5cf6', '#ff8a3d']

export default function Confetti({ count = 90 }) {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${Math.random() * 0.6}s`,
            animationDuration: `${2 + Math.random() * 1.6}s`,
            '--drift': `${(Math.random() - 0.5) * 240}px`,
            '--spin': `${Math.random() * 720 - 360}deg`,
            width: `${8 + Math.random() * 8}px`,
            height: `${10 + Math.random() * 10}px`,
          }}
        />
      ))}
    </div>
  )
}
