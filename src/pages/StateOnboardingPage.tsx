import React from 'react';
import { StateOnboardingWizard } from '../components/state/StateOnboardingWizard';
import { stateConfigService } from '../services/stateConfigService';
import { StateProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const StateOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveStateCode } = useLanguage();

  const handleComplete = async (profile: Partial<StateProfile>) => {
    try {
      await stateConfigService.onboardNewState(profile);
      if (profile.state_code) {
        setActiveStateCode(profile.state_code);
      }
      navigate('/admin/state-configuration');
    } catch (err) {
      alert('Error during onboarding: ' + err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 py-12 px-4 sm:px-6 lg:px-8">
      <StateOnboardingWizard
        onComplete={handleComplete}
        onCancel={() => navigate('/admin/state-configuration')}
      />
    </div>
  );
};
