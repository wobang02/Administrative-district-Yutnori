// 우측 상단 선생님용 조작판
export default function TeacherPanel({ canUndo, undoCount, admin, muted, onUndo, onNextTurn, onToggleAdmin, onToggleMute, onReset }) {
  return (
    <div className="teacher-panel" aria-label="선생님 조작판">
      <button className="tp-btn tp-undo" onClick={onUndo} disabled={!canUndo} title="Ctrl + Z">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        되돌리기{undoCount > 0 && <small>{undoCount}</small>}
      </button>
      <button className="tp-btn tp-next" onClick={onNextTurn}>다음 차례</button>
      <button className={`tp-btn tp-admin ${admin ? 'is-on' : ''}`} onClick={onToggleAdmin} aria-pressed={admin}>
        자유 배치 {admin ? '켜짐' : '꺼짐'}
      </button>
      <button className="tp-btn tp-icon" onClick={onToggleMute} aria-label={muted ? '소리 켜기' : '소리 끄기'} title={muted ? '소리 켜기' : '소리 끄기'}>
        {muted ? (
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>
      <button className="tp-btn tp-reset" onClick={onReset}>초기화</button>
    </div>
  )
}
