import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveScreen,
  Farm,
  FarmerChatMessage,
  Language,
  WeatherData,
  SatelliteObservation,
  CropDiseaseDetection,
  User,
} from '../../types';
import {
  Bot,
  MessageSquare,
  X,
  Send,
  Maximize2,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronDown,
  Sprout,
} from 'lucide-react';

interface FarmerBotWidgetProps {
  user: User;
  activeFarm?: Farm;
  weather?: WeatherData;
  satelliteObs?: SatelliteObservation;
  recentDetections?: CropDiseaseDetection[];
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const FarmerBotWidget: React.FC<FarmerBotWidgetProps> = ({
  user,
  activeFarm,
  weather,
  satelliteObs,
  recentDetections = [],
  currentScreen,
  onNavigate,
  language,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<FarmerChatMessage[]>([]);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If currently on farmer_bot screen, don't show the floating widget to avoid redundancy
  if (currentScreen === 'farmer_bot') {
    return null;
  }

  // Initial starter message for drawer
  useEffect(() => {
    let welcomeText = '';
    if (language === 'kn') {
      welcomeText = `🌾 **ನಮಸ್ಕಾರ ${user.name ? user.name.split(' ')[0] : 'ರೈತರೇ'}!** ನಾನು ನಿಮ್ಮ ಕಿಸಾನ್ ಮಿತ್ರ. ${
        activeFarm ? `ನಿಮ್ಮ "${activeFarm.name}" ತೋಟದ` : 'ನಿಮ್ಮ'
      } ಬೆಳೆ ರೋಗ, ಗೊಬ್ಬರ ಪ್ರಮಾಣ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಅಥವಾ ಸಬ್ಸಿಡಿಗಳ ಬಗ್ಗೆ ನಾನು ಸಲಹೆ ನೀಡಬಲ್ಲೆ.`;
    } else if (language === 'hi') {
      welcomeText = `🌾 **नमस्ते ${user.name ? user.name.split(' ')[0] : 'किसान मित्र'}!** मैं आपका किसान मित्र हूँ। फसल सुरक्षा, उर्वरक, मौसम व सरकारी योजनाओं के बारे में पूछें।`;
    } else {
      welcomeText = `🌾 **Hello ${user.name ? user.name.split(' ')[0] : 'Farmer'}!** I am Kisan Mitra. Connected to your "${
        activeFarm?.name || 'Farm'
      }". Ask me any agricultural question!`;
    }

    setMessages([
      {
        id: 'widget_init',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          language === 'kn' ? 'ನನ್ನ ತೋಟದ ಪ್ರಸ್ತುತ ಆರೋಗ್ಯ ಹೇಗಿದೆ?' : 'Analyze my active farm health',
          language === 'kn' ? 'ಕಾಫಿ ಎಲೆ ತುಕ್ಕು ರೋಗ ನಿಯಂತ್ರಣ' : 'Coffee Leaf Rust prevention',
          language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು & ಸಬ್ಸಿಡಿಗಳು' : 'Government farmer subsidies',
        ],
      },
    ]);
  }, [language, activeFarm?.id]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || isTyping) return;

    const userMsg: FarmerChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const historyContext = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/ai/farmer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          chatHistory: historyContext,
          language,
          farmContext: {
            farmName: activeFarm?.name,
            cropType: activeFarm?.cropType,
            locationName: activeFarm?.locationName,
            temperature: weather?.current?.temperature,
            condition: weather?.current?.condition,
            meanNdvi: satelliteObs?.meanNdvi,
          },
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      const botMsg: FarmerChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Here is the recommended agricultural practice.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: data.category || 'crop_advice',
        suggestions: data.suggestedFollowUps || [],
        recommendedScreen: data.recommendedScreen as ActiveScreen | undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text:
            language === 'kn'
              ? 'ಕಾಫಿ ಎಲೆ ತುಕ್ಕು ತಡೆಗಟ್ಟಲು 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಮತ್ತು ಸೂಕ್ತ ನೆರಳು ನಿರ್ವಹಣೆ ಪರಿಣಾಮಕಾರಿ.'
              : 'For plantation health, maintain 35% regulated shade canopy, apply bio-fungicides (Trichoderma viride), and inspect leaves closely.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: ['Check farm NDVI', 'View weather window'],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end print:hidden">
      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-3.5 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow">
                <Bot className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <span>Kisan Mitra AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h4>
                <p className="text-[10px] text-emerald-300 truncate max-w-[170px]">
                  {activeFarm?.name || 'Active Farm Connected'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('farmer_bot');
                }}
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
                title="Expand to Full Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      isUser
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                    {m.recommendedScreen && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate(m.recommendedScreen!);
                        }}
                        className="mt-2 w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <span>Open Diagnostic Tool</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                        {m.suggestions.slice(0, 2).map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(sug)}
                            className="text-[10px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 text-left transition"
                          >
                            💡 {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[10px]">Analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={language === 'kn' ? 'ಪ್ರಶ್ನೆ ಕೇಳಿ...' : 'Ask Kisan Mitra...'}
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnreadNotice(false);
        }}
        className="group relative flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ring-4 ring-emerald-500/20 border border-emerald-400/40"
      >
        <span className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </span>

        <span className="font-bold text-xs sm:text-sm tracking-tight pr-1">
          {isOpen ? 'Close Kisan AI' : 'Ask Kisan Mitra'}
        </span>

        {hasUnreadNotice && !isOpen && (
          <span className="absolute -top-2 -left-2 bg-amber-400 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
            AI Active
          </span>
        )}
      </button>
    </div>
  );
};
