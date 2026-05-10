import React, { useState, useEffect } from 'react';

const TOPIC_OPTIONS = [
  { value: 'daily',    label: '💬 일상회화' },
  { value: 'business', label: '💼 비즈니스' },
  { value: 'travel',   label: '✈️ 여행' },
  { value: 'toeic',    label: '📝 TOEIC' },
  { value: 'mba',      label: '🎓 영어 인터뷰' }
];

export default function NotificationSettings({ settings, onSave, onClose, permission, onRequestPermission }) {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [time, setTime] = useState(settings.time);
  const [topic, setTopic] = useState(settings.topic);
  const [testStatus, setTestStatus] = useState('');

  useEffect(() => {
    setEnabled(settings.enabled);
    setTime(settings.time);
    setTopic(settings.topic);
  }, [settings]);

  const handleEnableToggle = async () => {
    if (!enabled && permission !== 'granted') {
      const result = await onRequestPermission();
      if (result === 'granted') setEnabled(true);
    } else {
      setEnabled(!enabled);
    }
  };

  const handleSave = () => {
    onSave({ enabled, time, topic });
    onClose();
  };

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      setTestStatus('알림 권한이 없습니다.');
      return;
    }
    new Notification('Chloe 👩‍🏫', {
      body: 'Hi! Ready to practice English together? 😊',
      icon: '/favicon.ico',
      tag: 'chloe-test'
    });
    setTestStatus('테스트 알림을 보냈어요!');
    setTimeout(() => setTestStatus(''), 2500);
  };

  const permissionLabel = {
    granted: '✓ 허용됨',
    denied:  '✕ 차단됨 (브라우저 설정에서 허용해주세요)',
    default: '? 권한 필요'
  }[permission] || '? 권한 필요';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>🔔 알림 설정</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          <p style={styles.intro}>
            매일 정해진 시간에 Chloe가 먼저 말을 걸어요.
            (브라우저 탭이 열려 있어야 알림이 작동해요.)
          </p>

          <div style={styles.row}>
            <div style={styles.rowLabel}>브라우저 권한</div>
            <div style={{ ...styles.permission, color: permission === 'granted' ? '#065F46' : permission === 'denied' ? '#991B1B' : '#92400E' }}>
              {permissionLabel}
            </div>
          </div>

          <label style={styles.row}>
            <span style={styles.rowLabel}>알림 켜기</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleEnableToggle}
              disabled={permission === 'denied'}
              style={styles.checkbox}
            />
          </label>

          <label style={styles.row}>
            <span style={styles.rowLabel}>알림 시간</span>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={styles.timeInput}
            />
          </label>

          <label style={styles.row}>
            <span style={styles.rowLabel}>주제</span>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              style={styles.select}
            >
              {TOPIC_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <div style={styles.testRow}>
            <button style={styles.testBtn} onClick={handleTestNotification}>
              🔔 테스트 알림 보내기
            </button>
            {testStatus && <span style={styles.testStatus}>{testStatus}</span>}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>취소</button>
          <button style={styles.saveBtn} onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: '20px'
  },
  modal: {
    background: 'var(--surface)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)'
  },
  title: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: {
    background: 'transparent', border: 'none',
    fontSize: '18px', cursor: 'pointer', color: 'var(--text-secondary)'
  },
  body: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  intro: { fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '12px'
  },
  rowLabel: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
  permission: { fontSize: '13px', fontWeight: '500' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  timeInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '14px',
    background: 'var(--surface-2)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '14px',
    background: 'var(--surface-2)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    cursor: 'pointer'
  },
  testRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    paddingTop: '4px', flexWrap: 'wrap'
  },
  testBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    fontSize: '13px', fontWeight: '600',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  testStatus: { fontSize: '12px', color: 'var(--text-muted)' },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '8px',
    padding: '12px 20px',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface-2)'
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    fontSize: '14px', fontWeight: '600',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  saveBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--primary)',
    fontSize: '14px', fontWeight: '600',
    color: '#fff',
    cursor: 'pointer'
  }
};
