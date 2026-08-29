// Browser-Native Zero-Cost Web Speech API Integration for LandSync

export interface VoiceCommandMatch {
  action: 'NAVIGATE' | 'SEARCH' | 'READ_SUMMARY' | 'OPEN_ASSISTANT' | 'UNKNOWN';
  target?: string;
  transcript: string;
  feedback: string;
}

export const voiceAssistantService = {
  isSpeechRecognitionSupported: (): boolean => {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  },

  isSpeechSynthesisSupported: (): boolean => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  speakText: (text: string, lang: 'en' | 'hi' | 'ta' = 'en'): Promise<void> => {
    return new Promise((resolve) => {
      if (!voiceAssistantService.isSpeechSynthesisSupported()) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // cancel prior speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN'
      };
      utterance.lang = langMap[lang] || 'en-IN';

      // Pick localized voice if available in browser
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(lang) || v.lang.includes(langMap[lang]));
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  },

  stopSpeaking: (): void => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  parseVoiceCommand: (transcript: string): VoiceCommandMatch => {
    const clean = transcript.toLowerCase().trim();

    if (clean.includes('map') || clean.includes('gis') || clean.includes('नक्शा') || clean.includes('வரைபடம்')) {
      return {
        action: 'NAVIGATE',
        target: '/gis',
        transcript,
        feedback: 'Navigating to GIS Explorer and Cadastral Map.'
      };
    }

    if (clean.includes('citizen') || clean.includes('wizard') || clean.includes('journey') || clean.includes('सेवा')) {
      return {
        action: 'NAVIGATE',
        target: '/citizen/guided-journey',
        transcript,
        feedback: 'Opening Guided Citizen Journey Wizard.'
      };
    }

    if (clean.includes('admin') || clean.includes('system') || clean.includes('प्रशासन')) {
      return {
        action: 'NAVIGATE',
        target: '/admin/system',
        transcript,
        feedback: 'Opening System Administration & Operations Dashboard.'
      };
    }

    if (clean.includes('risk') || clean.includes('heat') || clean.includes('analytics') || clean.includes('जोखिम')) {
      return {
        action: 'NAVIGATE',
        target: '/analytics/maps',
        transcript,
        feedback: 'Opening Spatial Risk & Heat Maps Analytics.'
      };
    }

    if (clean.includes('open data') || clean.includes('satellite') || clean.includes('उपग्रह')) {
      return {
        action: 'NAVIGATE',
        target: '/gis/open-data',
        transcript,
        feedback: 'Opening Open Data & Satellite Imagery Explorer.'
      };
    }

    if (clean.includes('security') || clean.includes('compliance') || clean.includes('सुरक्षा')) {
      return {
        action: 'NAVIGATE',
        target: '/admin/security',
        transcript,
        feedback: 'Opening Security, Backup and Compliance Dashboard.'
      };
    }

    if (clean.includes('parcel') || clean.includes('tn-cbe') || clean.includes('भूखंड') || clean.includes('நிலம்')) {
      return {
        action: 'NAVIGATE',
        target: '/parcel/TN-CBE-001-124-1',
        transcript,
        feedback: 'Opening Parcel 360° for Survey 124/1.'
      };
    }

    if (clean.includes('assistant') || clean.includes('help') || clean.includes('मदद') || clean.includes('உதவி')) {
      return {
        action: 'OPEN_ASSISTANT',
        target: '/assistant',
        transcript,
        feedback: 'Opening LandSync Assistant.'
      };
    }

    return {
      action: 'SEARCH',
      target: transcript,
      transcript,
      feedback: `Searching LandSync for: "${transcript}"`
    };
  }
};
