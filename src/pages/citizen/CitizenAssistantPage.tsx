import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Bot,
  User,
  RefreshCw,
  Compass
} from 'lucide-react';
import { chatbotService, ChatMessage } from '../../services/chatbotService';
import { voiceAssistantService } from '../../services/voiceAssistantService';

export const CitizenAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'ta'>('en');
  const [quickFaqs, setQuickFaqs] = useState<{ id: string; question: string; category: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initial welcome message
    const initialWelcome: ChatMessage = {
      id: 'welcome-1',
      sender: 'assistant',
      text: chatbotService.getWelcomeGreeting(selectedLang),
      timestamp: new Date().toISOString(),
      suggested_actions: [
        'How do I verify land ownership?',
        'What documents are needed for Patta mutation?',
        'How does encroachment detection work?',
        'Show me Parcel 360°'
      ]
    };
    setMessages([initialWelcome]);
    setQuickFaqs(chatbotService.getFAQTopics());
  }, [selectedLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Query chatbot engine
    const response = await chatbotService.queryAssistant(text, selectedLang);
    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: response.answer,
      timestamp: new Date().toISOString(),
      intent: response.intent,
      suggested_actions: response.suggested_actions,
      parcel_reference: response.parcel_reference,
      navigation_target: response.navigation_target
    };

    setMessages((prev) => [...prev, botMsg]);

    // Auto-speak response if voice enabled
    if (isSpeaking) {
      voiceAssistantService.speakText(response.answer, selectedLang);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!voiceAssistantService.isSpeechRecognitionSupported()) {
      alert('Speech Recognition is not supported on this browser. Please use keyboard text input.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langCodes = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN' };
    recognition.lang = langCodes[selectedLang] || 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleSpeechOutput = () => {
    if (isSpeaking) {
      voiceAssistantService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const lastMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
      if (lastMsg) {
        voiceAssistantService.speakText(lastMsg.text, selectedLang);
      }
    }
  };

  return (
    <div id="citizen-assistant-page" className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-950 text-teal-300 flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">LandSync Citizen AI Assistant</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Voice & Multilingual
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural language answers on land rights, patta verification, mutation workflows, and survey records.
            </p>
          </div>
        </div>

        {/* Language & Voice Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700"
          >
            <option value="en">English (India)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>

          <button
            onClick={toggleSpeechOutput}
            className={`p-2.5 rounded-xl border transition ${
              isSpeaking
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title={isSpeaking ? 'Mute Voice Output' : 'Enable Voice Output'}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('/citizen/guided-journey')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-950 text-white hover:bg-blue-900 flex items-center gap-1.5 shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Guided Journey Wizard</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Quick FAQs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <HelpCircle className="w-4 h-4 text-blue-900" />
            <span>Popular Citizen Queries</span>
          </div>

          <div className="space-y-2">
            {quickFaqs.map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleSendMessage(faq.question)}
                className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-950 transition border border-slate-100"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Message Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[560px] lg:col-span-3">
          {/* Message List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-950 text-teal-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    LS
                  </div>
                )}

                <div
                  className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-blue-950 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Navigation / Parcel Action Pill */}
                  {msg.navigation_target && (
                    <div className="pt-2">
                      <button
                        onClick={() => navigate(msg.navigation_target!)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-blue-950 hover:bg-slate-50 flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                      >
                        <span>Open Details ({msg.parcel_reference || 'View Record'})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/80 hover:bg-white text-slate-800 border border-slate-200 shadow-2xs"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="block text-[9px] opacity-60 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={
                  selectedLang === 'hi'
                    ? 'अपनी भूमि या खतौनी के बारे में कुछ भी पूछें...'
                    : selectedLang === 'ta'
                    ? 'உங்கள் நிலம் அல்லது பட்டா பற்றி கேளுங்கள்...'
                    : 'Ask about Patta, mutation, survey numbers, encroachment, or fees...'
                }
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-xs border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />

              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-xl border transition ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Click to speak'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-3 rounded-xl bg-blue-950 text-white hover:bg-blue-900 transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
