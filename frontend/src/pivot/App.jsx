import { useState } from 'react';
import { loadProfile } from './profile.js';
import Onboarding from './Onboarding.jsx';
import DailySession from './DailySession.jsx';

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());

  if (!profile) {
    return <Onboarding onDone={setProfile} />;
  }

  return <DailySession profile={profile} onProfileChange={setProfile} />;
}
