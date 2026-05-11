import React, { useState } from 'react';
import Practice from './coach/Practice.jsx';
import Review from './coach/Review.jsx';
import Progress from './coach/Progress.jsx';
import Mistakes from './coach/Mistakes.jsx';

const TABS = [
  { id: 'practice', label: 'Practice', emoji: '✍️' },
  { id: 'review', label: 'Review', emoji: '🪞' },
  { id: 'progress', label: 'Progress', emoji: '📈' },
  { id: 'mistakes', label: 'Mistakes', emoji: '🌱' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('practice');
  const [refreshKey, setRefreshKey] = useState(0);

  function bumpRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="coach-app">
      <header className="coach-header">
        <div className="coach-brand">Growth Coach 🌿</div>
        <div className="coach-tagline">English, one sentence at a time.</div>
      </header>

      <main className="coach-main">
        {activeTab === 'practice' && <Practice onSaved={bumpRefresh} />}
        {activeTab === 'review' && <Review refreshKey={refreshKey} />}
        {activeTab === 'progress' && <Progress refreshKey={refreshKey} />}
        {activeTab === 'mistakes' && <Mistakes refreshKey={refreshKey} onCleared={bumpRefresh} />}
      </main>

      <nav className="coach-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={tab.id === activeTab ? 'coach-tab coach-tab-active' : 'coach-tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="coach-tab-emoji">{tab.emoji}</span>
            <span className="coach-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
