import { useState } from 'react';
import { loadProfile } from './profile.js';
import Onboarding from './Onboarding.jsx';
import LevelPicker from './LevelPicker.jsx';
import DailySession from './DailySession.jsx';

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());

  if (!profile) {
    return <Onboarding onDone={setProfile} />;
  }

  if (!profile.identity.level) {
    return <LevelPicker profile={profile} onDone={setProfile} />;
  }

  return <DailySession profile={profile} onProfileChange={setProfile} />;
}
