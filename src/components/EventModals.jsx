// 지역 이벤트 팝업: 제주, 퀴즈, 확인창, 우승
import Modal from './Modal.jsx'
import AnimalIcon from './AnimalIcon.jsx'

function TeamTag({ team }) {
  return (
    <span className="team-tag" style={{ '--team': team.color }}>
      <AnimalIcon animal={team.animal} size={30} /> {team.name}
    </span>
  )
}

export function JejuModal({ team, outcome, onConfirm }) {
  const rest = outcome === 'rest'
  return (
    <Modal tone="jeju">
      <TeamTag team={team} />
      <p className="modal-kicker">제주특별자치도 도착</p>
      <div className="modal-art">
        {rest ? (
          <svg viewBox="0 0 160 70" width="220" aria-hidden="true">
            <path d="M0 40 q20 -24 40 0 t40 0 t40 0 t40 0 v30 h-160z" fill="#5fa8e0" />
            <path d="M0 52 q20 -18 40 0 t40 0 t40 0 t40 0 v18 h-160z" fill="#2f6fde" />
          </svg>
        ) : (
          <svg viewBox="0 0 120 80" width="160" aria-hidden="true">
            <path d="M8 40 q0 -8 14 -8 h70 q20 0 24 8 q-4 8 -24 8 h-70 q-14 0 -14 -8 z" fill="#fff" stroke="#2a2420" strokeWidth="3" />
            <path d="M48 34 l20 -26 h10 l-10 26 z M48 46 l20 26 h10 l-10 -26 z" fill="#2f6fde" stroke="#2a2420" strokeWidth="2.5" />
            <path d="M14 34 l-6 -14 h8 l10 14 z" fill="#2f6fde" stroke="#2a2420" strokeWidth="2.5" />
          </svg>
        )}
      </div>
      <h2 className="modal-title">{rest ? '풍랑주의보 발령!' : '비행기 탑승!'}</h2>
      <p className="modal-desc">
        {rest ? '바다에 큰 파도가 일어 배가 뜨지 못해요. 다음 차례를 한 번 쉬어요.' : '제주국제공항에서 비행기를 타고 서울특별시로 바로 날아가요.'}
      </p>
      <div className="modal-actions">
        <button className="btn-primary" onClick={onConfirm}>{rest ? '확인 (1회 쉬기)' : '서울로 출발'}</button>
      </div>
    </Modal>
  )
}

export function KumgangModal({ team, onConfirm }) {
  return (
    <Modal tone="kumgang">
      <TeamTag team={team} />
      <p className="modal-kicker">특별 칸</p>
      <div className="modal-art">
        <svg viewBox="0 0 200 90" width="240" aria-hidden="true">
          <path d="M0 90 L40 30 L60 55 L90 10 L120 50 L140 28 L200 90 Z" fill="#2e8b57" />
          <path d="M90 10 L102 27 L95 25 L90 32 L84 25 L78 27 Z M40 30 L48 42 L40 40 L33 42 Z M140 28 L147 38 L140 36 L134 38 Z" fill="#fff" />
        </svg>
      </div>
      <h2 className="modal-title">금강산국제관광특구</h2>
      <p className="modal-desc">일만 이천 봉의 멋진 경치에 힘이 솟아요! 윷을 한 번 더 던지세요.</p>
      <div className="modal-actions">
        <button className="btn-primary" onClick={onConfirm}>한 번 더 던지기</button>
      </div>
    </Modal>
  )
}

export function QuizModal({ team, nodeName, onCorrect, onWrong }) {
  return (
    <Modal tone="quiz">
      <TeamTag team={team} />
      <p className="modal-kicker">{nodeName} 퀴즈 찬스</p>
      <h2 className="modal-title big">행정구역 퀴즈 시간!</h2>
      <p className="modal-desc">선생님이 내는 문제를 듣고 모둠이 함께 답해 보세요.</p>
      <div className="modal-actions two">
        <button className="btn-correct" onClick={onCorrect}>정답</button>
        <button className="btn-wrong" onClick={onWrong}>오답</button>
      </div>
    </Modal>
  )
}

export function ConfirmReset({ onRestart, onSetup, onCancel }) {
  return (
    <Modal>
      <h2 className="modal-title">게임을 초기화할까요?</h2>
      <p className="modal-desc">지금까지의 말 위치와 점수가 모두 지워져요.</p>
      <div className="modal-actions column">
        <button className="btn-primary" onClick={onRestart}>같은 모둠으로 다시 시작</button>
        <button className="btn-secondary" onClick={onSetup}>모둠 설정부터 다시</button>
        <button className="btn-ghost" onClick={onCancel}>취소</button>
      </div>
    </Modal>
  )
}

export function WinModal({ team, onClose }) {
  return (
    <Modal tone="win">
      <div className="win-avatar" style={{ '--team': team.color }}><AnimalIcon animal={team.animal} size={110} /></div>
      <h2 className="modal-title big">{team.name} 우승!</h2>
      <p className="modal-desc">모든 말이 부산에서 출발해 나선특별시에 도착했어요.</p>
      <div className="modal-actions">
        <button className="btn-primary" onClick={onClose}>계속 보기</button>
      </div>
    </Modal>
  )
}
