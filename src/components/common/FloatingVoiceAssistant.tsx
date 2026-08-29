import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Mic,
  MicOff,
  X,
  Send,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  ArrowRight
} from 'lucide-react';
import { chatbotService, ChatMessage } from '../../services/chatbotService';
import { voiceAssistantService } from '../../services/voiceAssistantService';

export const FloatingVoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Namaste! I am your LandSync AI Assistant. You can speak or type to check land records, verify Patta, or navigate.',
      timestamp: new Date().toISOString(),
      suggested_actions: ['Inspect Survey 124/1', 'Open GIS Map', 'Check Compliance']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSend = async (query?: string) => {
    const text = query || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    const res = await chatbotService.queryAssistant(text);
    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      sender: 'assistant',
      text: res.answer,
      timestamp: new Date().toISOString(),
      navigation_target: res.navigation_target,
      suggested_actions: res.suggested_actions
    };

    setMessages((prev) => [...prev, botMsg]);

    if (isVoiceActive) {
      voiceAssistantService.speakText(res.answer);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!voiceAssistantService.isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-IN';

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      handleSend(transcript);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-blue-950 text-white shadow-xl hover:bg-blue-900 transition flex items-center gap-2 group ring-4 ring-blue-900/20"
          title="Open LandSync Assistant"
        >
          <Bot className="w-6 h-6 text-teal-300 group-hover:scale-110 transition" />
          <span className="text-xs font-bold pr-1 hidden sm:inline">Ask LandSync</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[500px] overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 bg-blue-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-teal-300 flex items-center justify-center font-bold text-xs">
                LS
              </div>
              <div>
                <h3 className="font-bold text-xs">LandSync Assistant</h3>
                <span className="text-[10px] text-teal-400">Zero-Cost Heuristic AI</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`p-1.5 rounded-lg text-slate-300 hover:text-white transition ${
                  isVoiceActive ? 'text-teal-400 bg-blue-900' : ''
                }`}
                title={isVoiceActive ? 'Voice enabled' : 'Voice muted'}
              >
                {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                    m.sender === 'user'
                      ? 'bg-blue-950 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>

                  {m.navigation_target && (
                    <button
                      onClick={() => {
                        navigate(m.navigation_target!);
                        setIsOpen(false);
                      }}
                      className="mt-2 px-2.5 py-1 rounded-lg bg-white text-blue-950 font-bold text-[11px] flex items-center gap-1 border border-slate-200 shadow-2xs"
                    >
                      <span>Open Link</span> <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {m.suggested_actions && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(act)}
                          className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-semibold border border-slate-200 hover:bg-slate-50"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white"
            />
            <button
              onClick={toggleMic}
              className={`p-2 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-blue-950 text-white hover:bg-blue-900 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
