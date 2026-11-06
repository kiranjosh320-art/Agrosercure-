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
import { useTranslation } from '../../i18n/translations';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Sprout,
  CloudSun,
  Layers,
  Award,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  FileText,
  UserCheck,
} from 'lucide-react';

interface FarmerBotScreenProps {
  user: User;
  activeFarm?: Farm;
  weather?: WeatherData;
  satelliteObs?: SatelliteObservation;
  recentDetections?: CropDiseaseDetection[];
  initialPrompt?: string;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const FarmerBotScreen: React.FC<FarmerBotScreenProps> = ({
  user,
  activeFarm,
  weather,
  satelliteObs,
  recentDetections = [],
  initialPrompt,
  onNavigate,
  language,
}) => {
  const t = useTranslation(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Storage key for bot history
  const historyKey = `agrosecure_bot_history_${user.id || 'default'}`;

  // Initial welcome message tailored to language
  const getInitialMessage = (): FarmerChatMessage => {
    let text = '';
    let suggestions: string[] = [];

    if (language === 'kn') {
      text = `🌾 **ನಮಸ್ಕಾರ ${user.name || 'ರೈತ ಬಾಂಧವರೇ'}!** ನಾನು ನಿಮ್ಮ **ಅಗ್ರೋಸೆಕ್ಯೂರ್ ಕಿಸಾನ್ ಮಿತ್ರ (AgroBot AI)**.\n\nನಿಮ್ಮ ತೋಟ **"${activeFarm?.name || 'ಕಾಫಿ ತೋಟ'}"** ದ ಬೆಳೆ ಆರೋಗ್ಯ, ರೋಗ ನಿಯಂತ್ರಣ (ಕಾಫಿ ಎಲೆ ತುಕ್ಕು, ಕಾಯಿಕೊರಕ), ಮಳೆಗಾಲದ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ಉಪಗ್ರಹ NDVI ವಿಶ್ಲೇಷಣೆ, ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ಅಲರ್ಟ್‌ಗಳು ಮತ್ತು ಪಿಎಂಎಫ್‌ಬಿವೈ ಬೆಳೆ ವಿಮೆ ರಕ್ಷಣೆಯ ಬಗ್ಗೆ ನಾನು ನಿಖರ ಸಲಹೆ ನೀಡಬಲ್ಲೆ.\n\nನನ್ನನ್ನು ಧ್ವನಿ (ಮೈಕ್) ಅಥವಾ ಟೈಪ್ ಮಾಡುವ ಮೂಲಕ ಪ್ರಶ್ನಿಸಬಹುದು. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`;
      suggestions = [
        'ನನ್ನ ತೋಟದ ಪ್ರಸ್ತುತ ಆರೋಗ್ಯ ಮತ್ತು ಹವಾಮಾನ ವಿಶ್ಲೇಷಿಸಿ',
        'ಕಾಫಿ ಎಲೆ ತುಕ್ಕು ರೋಗಕ್ಕೆ ಬೋರ್ಡೋ ಸಿಂಪಡಣೆ ಹೇಗೆ?',
        'ಪಿಎಂಎಫ್‌ಬಿವೈ (PMFBY) ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಆರ್ಥಿಕ ನಷ್ಟ ಲೆಕ್ಕಾಚಾರ',
        'ಮಳೆಗಾಲದ ಮುನ್ನ ರಸಗೊಬ್ಬರ (NPK) ವೇಳಾಪಟ್ಟಿ ಏನು?',
        'ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
      ];
    } else if (language === 'hi') {
      text = `🌾 **नमस्ते ${user.name || 'किसान मित्र'}!** मैं आपका **एग्रोसिक्योर किसान मित्र (AgroBot AI)** हूँ।\n\nमैं आपके खेत **"${activeFarm?.name || 'कॉफ़ी बागान'}"** के फसल स्वास्थ्य, कीट व रोग नियंत्रण, उर्वरक प्रबंधन, 14-दिवसीय मौसम चेतावनी, उपग्रह NDVI, विसंगति इंजन और फसल बीमा वित्तीय सुरक्षा की जानकारी देने के लिए यहाँ हूँ।\n\nआप माइक से बोलकर या लिखकर सवाल पूछ सकते हैं। आज आपकी क्या मदद करूँ?`;
      suggestions = [
        'मेरे खेत का वर्तमान स्वास्थ्य व मौसम बताएं',
        'कॉफ़ी रतुआ (Leaf Rust) का जैविक नियंत्रण कैसे करें?',
        'पीएम फसल बीमा योजना (PMFBY) क्लेम प्रक्रिया क्या है?',
        'मानसून से पहले संतुलित उर्वरक की मात्रा क्या हो?',
        'क्रॉप डॉक्टर अलर्ट की जानकारी दें',
      ];
    } else if (language === 'es') {
      text = `🌾 **¡Hola ${user.name || 'Estimado Productor'}!** Soy **AgroBot AI**, su Asesor Agronómico y Compañero de Cultivo en AgroSecure.\n\nEstoy conectado con su finca **"${activeFarm?.name || 'Finca Cafetera'}"**, los datos satelitales Sentinel-2, el motor de anomalías y el clima en tiempo real. Puedo asistirle con el control de roya, fertilización NPK, seguros agrícolas y alertas climáticas.\n\n¿En qué le puedo orientar hoy?`;
      suggestions = [
        'Analizar la salud actual y clima de mi finca',
        'Manejo integrado para la Roya del Café',
        'Plan de fertilización recomendado para esta época',
        '¿Cómo interpretar el índice NDVI de mi cafetal?',
      ];
    } else {
      text = `🌾 **Welcome ${user.name || 'Farmer'}!** I am **AgroBot AI (Kisan Mitra)**, your AgroSecure Agronomist & Precision Farming Companion.\n\nI am synchronized with your active farm **"${activeFarm?.name || 'Estate'}"** (${activeFarm?.cropType || 'Coffee'}), live Open-Meteo weather (${weather?.current ? `${weather.current.temperature}°C, ${weather.current.condition}` : 'Active'}), Sentinel-2 anomaly engine, and PMFBY financial risk calculations.\n\nAsk me anything regarding crop disease prevention, bio-fertilizer schedules, weather spraying windows, satellite NDVI readings, or government crop insurance!`;
      suggestions = [
        'Analyze my active farm health & weather status',
        'How to prevent and treat Coffee Leaf Rust organically?',
        'Calculate my PMFBY crop loss insurance claim',
        'Check precision spraying window for my coordinates',
        'Pre-monsoon NPK fertilizer application schedule',
      ];
    }

    return {
      id: 'init_msg',
      sender: 'bot',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'crop_advice',
      suggestions,
    };
  };

  const [messages, setMessages] = useState<FarmerChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [getInitialMessage()];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'kn' | 'hi' | 'en'>(() => {
    return language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en';
  });
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [autoSpeakNext, setAutoSpeakNext] = useState(false);

  // Check Web Speech Recognition and Web Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (rec) setVoiceSupported(true);
      if ('speechSynthesis' in window) setSpeechSupported(true);
    }
  }, []);

  // Sync voice language when user changes app language
  useEffect(() => {
    if (language === 'kn' || language === 'hi' || language === 'en') {
      setVoiceLang(language);
    }
  }, [language]);

  // Save conversation history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(historyKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  }, [messages, historyKey]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech Recognition Handler (Microphone Input)
  const toggleSpeechRecognition = () => {
    setVoiceNotice(null);
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice('Speech recognition is not available in this browser. Please type your question.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select speech language matching chosen voice language (Kannada, Hindi, English)
      const langCodes: Record<'kn' | 'hi' | 'en', string> = {
        kn: 'kn-IN',
        hi: 'hi-IN',
        en: 'en-IN',
      };
      recognition.lang = langCodes[voiceLang] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setAutoSpeakNext(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          setVoiceNotice('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (err.error !== 'no-speech') {
          setVoiceNotice(`Speech recognition notice: ${err.error || 'Please speak clearly and try again.'}`);
        }
        setTimeout(() => setVoiceNotice(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
      setVoiceNotice('Unable to start microphone. Please check browser permissions.');
      setTimeout(() => setVoiceNotice(null), 4000);
    }
  };

  // Text to Speech Handler (Read aloud)
  const handleSpeakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks and hash tags before speaking
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set voice language
    const langCodes: Record<Language, string> = {
      kn: 'kn-IN',
      hi: 'hi-IN',
      es: 'es-ES',
      en: 'en-IN',
    };
    utterance.lang = langCodes[language] || 'en-US';
    utterance.rate = 0.95; // comfortable cadence for comprehension

    utterance.onend = () => {
      setIsSpeakingId(null);
    };
    utterance.onerror = () => {
      setIsSpeakingId(null);
    };

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Build Farm Context for AI
  const getFarmContextObject = () => {
    const latestDisease = recentDetections[0];
    return {
      farmName: activeFarm?.name || 'My Plantation',
      cropType: activeFarm?.cropType || 'Coffee Arabica',
      variety: activeFarm?.coffeeVariety || 'Selection 795',
      locationName: activeFarm?.locationName || 'Chikmagalur, Karnataka, India',
      lat: activeFarm?.coordinates.lat || 13.4215,
      lng: activeFarm?.coordinates.lng || 75.7621,
      areaAcres: activeFarm?.areaAcres || 12.4,
      temperature: weather?.current.temperature || 24,
      condition: weather?.current.condition || 'Partly Cloudy',
      humidity: weather?.current.relativeHumidity || 68,
      rain: weather?.current.precipitation || 0,
      meanNdvi: satelliteObs?.meanNdvi || 0.69,
      healthStatus:
        (satelliteObs?.meanNdvi || 0.69) > 0.6
          ? 'Healthy & Dense'
          : (satelliteObs?.meanNdvi || 0.69) > 0.45
          ? 'Moderate Stress'
          : 'Severe Vegetation Stress',
      flaggedIssues: latestDisease
        ? `${latestDisease.conditionName} detected with ${latestDisease.confidence}% confidence`
        : 'None active',
    };
  };

  // Send Message Handler
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
      const historyContext = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const chatLang = voiceLang || language;
      const res = await fetch('/api/ai/farmer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          chatHistory: historyContext,
          language: chatLang,
          farmContext: getFarmContextObject(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const botMsg: FarmerChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Here is the agricultural guidance for your plantation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: data.category || 'crop_advice',
        suggestions: data.suggestedFollowUps || [],
        recommendedScreen: data.recommendedScreen as ActiveScreen | undefined,
      };

      setMessages((prev) => [...prev, botMsg]);

      // If farmer asked via voice, auto-play speech response
      if (autoSpeakNext) {
        handleSpeakText(botMsg.text, botMsg.id);
        setAutoSpeakNext(false);
      }
    } catch (err: any) {
      console.warn('Bot response error, providing agronomist fallback:', err);
      const fallbackMsg: FarmerChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'bot',
        text:
          language === 'kn'
            ? `🌾 **ಕೃಷಿ ಸಲಹೆ:** ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಕಾಫಿ ಮಂಡಳಿಯ ಮಾರ್ಗಸೂಚಿಯಂತೆ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಣೆ, ನಿಯಂತ್ರಿತ ನೆರಳು ಮತ್ತು ಸೂಕ್ತ ಬಸಿಗಾಲುವೆಗಳು ಅತ್ಯಗತ್ಯ. ಹೆಚ್ಚಿನ ಪರೀಕ್ಷೆಗೆ 'AI ರೋಗ ಪತ್ತೆ' ಅಥವಾ 'ಹವಾಮಾನ' ವಿಭಾಗವನ್ನು ಬಳಸಿ.`
            : language === 'hi'
            ? `🌾 **कृषि सलाह:** आपकी फसल सुरक्षा के लिए 1% बोर्डो मिश्रण का छिड़काव, उचित छाया प्रबंधन और जल निकासी आवश्यक है। अधिक जांच के लिए हमारे AI रोग जांच केंद्र का उपयोग करें।`
            : `🌾 **Agronomist Advisory:** For plantation health, maintain 35% regulated shade canopy, apply bio-fungicides (*Trichoderma viride*) at the start of monsoons, and consult our AI Leaf Disease Lab to diagnose visible leaf spots.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'crop_advice',
        suggestions: [
          'How to check my farm NDVI?',
          'Best organic fertilizer dose',
          'Government subsidies for coffee farmers',
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoSpeakNext) {
        handleSpeakText(fallbackMsg.text, fallbackMsg.id);
        setAutoSpeakNext(false);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Clear Conversation History
  const handleClearHistory = () => {
    const initial = [getInitialMessage()];
    setMessages(initial);
    try {
      localStorage.removeItem(historyKey);
    } catch {}
  };

  // Quick Action Buttons
  const quickTopics = [
    {
      label: language === 'kn' ? 'ಎಲೆ ರೋಗ & ತುಕ್ಕು' : language === 'hi' ? 'पत्ती रतुआ व रोग' : 'Leaf Rust & Pests',
      icon: '🍂',
      query:
        language === 'kn'
          ? 'ನನ್ನ ತೋಟದಲ್ಲಿ ಕಾಫಿ ಎಲೆ ತುಕ್ಕು ರೋಗ ತಡೆಗಟ್ಟುವುದು ಹೇಗೆ?'
          : 'How to control and prevent Coffee Leaf Rust and Berry Borer in my plantation?',
    },
    {
      label: language === 'kn' ? 'ಗೊಬ್ಬರ & ಪೋಷಕಾಂಶ' : language === 'hi' ? 'उर्वरक प्रबंधन' : 'Fertilizer & NPK',
      icon: '🧪',
      query:
        language === 'kn'
          ? 'ಮಳೆಗಾಲದ ಮುನ್ನ ಕಾಫಿ ಗಿಡಗಳಿಗೆ ಯಾವ ರಸಗೊಬ್ಬರ (NPK) ಮತ್ತು ಸಾವಯವ ಗೊಬ್ಬರ ನೀಡಬೇಕು?'
          : 'What is the recommended pre-monsoon NPK and bio-fertilizer schedule for my coffee estate?',
    },
    {
      label: language === 'kn' ? 'ಹವಾಮಾನ & ಸಿಂಪಡಣೆ' : language === 'hi' ? 'मौसम व छिड़काव' : 'Weather & Spraying',
      icon: '☁️',
      query:
        language === 'kn'
          ? 'ಪ್ರಸ್ತುತ ಹವಾಮಾನದಲ್ಲಿ ಕೀಟನಾಶಕ ಅಥವಾ ರಸಗೊಬ್ಬರ ಸಿಂಪಡಿಸಲು ಸೂಕ್ತ ಸಮಯವೇ?'
          : 'Based on current weather and rain forecast, is it a safe spraying window today?',
    },
    {
      label: language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : language === 'hi' ? 'सरकारी योजनाएं' : 'Govt Subsidies',
      icon: '🏛️',
      query:
        language === 'kn'
          ? 'ಕಾಫಿ ಮಂಡಳಿ, ಪಿಎಂ ಕಿಸಾನ್ ಮತ್ತು ಬೆಳೆ ವಿಮೆ ಸಬ್ಸಿಡಿಗಳು ಯಾವುವು ಮತ್ತು ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು?'
          : 'What government subsidies, Coffee Board schemes, and PM-KISAN benefits can I apply for?',
    },
    {
      label: language === 'kn' ? 'ಉಪಗ್ರಹ NDVI ಮಾರ್ಗದರ್ಶಿ' : language === 'hi' ? 'उपग्रह NDVI जानकारी' : 'Satellite NDVI Guide',
      icon: '🛰️',
      query:
        language === 'kn'
          ? 'ನನ್ನ ತೋಟದ ಉಪಗ್ರಹ NDVI ಸ್ಕೋರ್‌ನ ಅರ್ಥವೇನು ಮತ್ತು ಒತ್ತಡವಿರುವ ವಲಯವನ್ನು ಹೇಗೆ ಸುಧಾರಿಸುವುದು?'
          : 'Explain my active farm Sentinel-2 NDVI score and how to improve canopy density in stressed blocks.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-xl flex items-center justify-center shrink-0 ring-4 ring-emerald-500/30">
              <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Kisan Mitra <span className="text-emerald-400">AI</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-300 border border-emerald-600/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online Agronomist
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Gemini 3.8 Flash Powered
                </span>
              </div>

              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl">
                {language === 'kn'
                  ? 'ರೈತ ಮಿತ್ರ: ಬೆಳೆ ರೋಗಗಳು, ಗೊಬ್ಬರ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ಉಪಗ್ರಹ ಮಾಹಿತಿ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕೃಷಿ ತಜ್ಞ.'
                  : language === 'hi'
                  ? 'किसान मित्र: फसल रोग, खाद-उर्वरक, मौसम चेतावनी, उपग्रह निगरानी और सरकारी योजनाओं हेतु आपका निजी कृषि सलाहकार।'
                  : 'Your dedicated agronomist companion: personalized crop health, organic disease cures, fertilizer schedules, live weather advice, and subsidy assistance.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 rounded-xl border border-emerald-700/80 transition flex items-center gap-1.5 shadow-sm"
              title="Clear Chat History"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Live Synchronized Farm Context Strip */}
        {activeFarm && (
          <div className="mt-4 pt-4 border-t border-emerald-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/50">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Active Parcel</span>
              <span className="font-bold text-white truncate block">{activeFarm.name}</span>
              <span className="text-[11px] text-emerald-300/80">{activeFarm.cropType}</span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/50">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Location & Area</span>
              <span className="font-bold text-white truncate block">{activeFarm.locationName}</span>
              <span className="text-[11px] text-emerald-300/80">{activeFarm.areaAcres} Acres</span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/50">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Live Weather</span>
              <span className="font-bold text-white block">
                {weather?.current ? `${weather.current.temperature}°C &bull; ${weather.current.condition}` : '24°C, Normal'}
              </span>
              <span className="text-[11px] text-emerald-300/80">
                Rain: {weather?.current.precipitation || 0}mm | RH: {weather?.current.relativeHumidity || 68}%
              </span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/50">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Canopy NDVI</span>
              <span className="font-bold text-white block">
                {satelliteObs?.meanNdvi || 0.69} Mean NDVI
              </span>
              <span className="text-[11px] text-emerald-300/80">Sentinel-2 MSI</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat & Guidance Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Topic Quick Launcher & Common Farmer Questions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Explore Topics</span>
            </h3>

            <div className="space-y-2">
              {quickTopics.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.query)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/80 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Direct Navigation to App Modules */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 shadow-sm">
            <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>Quick App Shortcuts</span>
            </h4>
            <p className="text-[11px] text-emerald-800/80 mb-3">
              Kisan Mitra can directly navigate you to the appropriate diagnostic tool:
            </p>

            <div className="space-y-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => onNavigate('disease_detection')}
                className="w-full text-left p-2 rounded-lg bg-white/90 hover:bg-white text-emerald-900 border border-emerald-200 flex items-center justify-between transition shadow-2xs"
              >
                <span>🔬 AI Leaf Disease Lab</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('satellite')}
                className="w-full text-left p-2 rounded-lg bg-white/90 hover:bg-white text-emerald-900 border border-emerald-200 flex items-center justify-between transition shadow-2xs"
              >
                <span>🛰️ Sentinel-2 NDVI Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('weather')}
                className="w-full text-left p-2 rounded-lg bg-white/90 hover:bg-white text-emerald-900 border border-emerald-200 flex items-center justify-between transition shadow-2xs"
              >
                <span>☁️ 14-Day Weather & Spraying</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('mapping')}
                className="w-full text-left p-2 rounded-lg bg-white/90 hover:bg-white text-emerald-900 border border-emerald-200 flex items-center justify-between transition shadow-2xs"
              >
                <span>🗺️ GPS Boundary & Map Search</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Chat Conversation Window */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl shadow-md border border-slate-200 h-[680px] overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeaking = isSpeakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-emerald-200 mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Header tag for bot message */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 text-[11px]">
                        <span className="font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <Sprout className="w-3 h-3 text-emerald-600" />
                          Kisan Mitra Advisory
                        </span>

                        <div className="flex items-center gap-1">
                          {speechSupported && (
                            <button
                              type="button"
                              onClick={() => handleSpeakText(msg.text, msg.id)}
                              className={`p-1 rounded-md transition ${
                                isSpeaking
                                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                                  : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                              }`}
                              title={isSpeaking ? 'Stop speaking' : 'Listen to this advice'}
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>
                      </div>
                    )}

                    {/* Message Body with Line Breaks & Markdown formatting */}
                    <div className="whitespace-pre-line space-y-1">
                      {msg.text.split('\n').map((paragraph, pIdx) => {
                        if (!paragraph) return <div key={pIdx} className="h-1" />;
                        // Bold parsing
                        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={pIdx}>
                            {parts.map((part, partIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={partIdx} className={isUser ? 'text-white' : 'text-slate-950 font-bold'}>
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return <span key={partIdx}>{part}</span>;
                            })}
                          </p>
                        );
                      })}
                    </div>

                    {/* Direct Screen Action Link Button if provided */}
                    {msg.recommendedScreen && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => onNavigate(msg.recommendedScreen!)}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <span>Open Recommended Diagnostic Tool</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Follow-up Suggestion Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Follow-up Questions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSendMessage(sug)}
                              className="text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition shadow-2xs text-left"
                            >
                              💡 {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow">
                      {user.name ? user.name.charAt(0) : 'F'}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 justify-start animate-in fade-in">
                <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-emerald-200">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="font-medium ml-1">Kisan Mitra is researching agricultural protocols...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar & Controls */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            {/* Voice Notice (Inline toast instead of alert) */}
            {voiceNotice && (
              <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <span>{voiceNotice}</span>
                <button
                  type="button"
                  onClick={() => setVoiceNotice(null)}
                  className="text-amber-700 hover:text-amber-950 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Voice Listening Waveform Banner */}
            {isListening && (
              <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-between shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-black tracking-wide">
                      {voiceLang === 'kn'
                        ? '🎙️ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ (Listening in Kannada)...'
                        : voiceLang === 'hi'
                        ? '🎙️ हिन्दी में बोलें (Listening in Hindi)...'
                        : '🎙️ Speak now in English...'}
                    </p>
                    <p className="text-[10px] text-white/90">
                      Speak your question clearly. The AI will respond and speak the answer back.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className="px-3 py-1.5 rounded-xl bg-white text-red-700 text-xs font-black hover:bg-red-50 transition shadow-sm"
                >
                  Finish
                </button>
              </div>
            )}

            {/* Voice Language Selector Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Voice Chatbox:
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVoiceLang('kn')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    voiceLang === 'kn'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Speak in Kannada"
                >
                  ಕನ್ನಡ
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('hi')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    voiceLang === 'hi'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Speak in Hindi"
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    voiceLang === 'en'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Speak in English"
                >
                  English
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Dictation Button */}
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-3 rounded-2xl border transition shadow-sm shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse ring-4 ring-red-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                  title={
                    isListening
                      ? 'Listening... Click to stop'
                      : `Speak in ${voiceLang === 'kn' ? 'Kannada' : voiceLang === 'hi' ? 'Hindi' : 'English'}`
                  }
                >
                  {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-emerald-700" />}
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  voiceLang === 'kn'
                    ? 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ (ಮೈಕ್ ಒತ್ತಿ) ಅಥವಾ ಟೈಪ್ ಮಾಡಿ...'
                    : voiceLang === 'hi'
                    ? 'हिन्दी में बोलें (माइक दबाएं) या टाइप करें...'
                    : 'Speak in English (tap mic) or type your query...'
                }
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition disabled:cursor-not-allowed shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <span>🌾 Multi-lingual Voice AI</span>
              <span>&bull;</span>
              <span>Kannada, Hindi, English</span>
              <span>&bull;</span>
              <span>Audio Playback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
