import { useState } from 'react';
import { loadProfile } from './profile.js';
import Onboarding from './Onboarding.jsx';
import LevelPicker from './LevelPicker.jsx';
import DailySession from './DailySession.jsx';
import Review from './Review.jsx';

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [view, setView] = useState('session');

  if (!profile) {
    return <Onboarding onDone={setProfile} />;
  }

  if (!profile.identity.level) {
    return <LevelPicker profile={profile} onDone={setProfile} />;
  }

  if (view === 'review') {
    return <Review profile={profile} onBack={() => setView('session')} />;
  }

  return (
    <DailySession
      profile={profile}
      onProfileChange={setProfile}
      onNavReview={() => setView('review')}
    />
  );
}
