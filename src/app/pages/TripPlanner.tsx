import { useState, useEffect, useRef, useMemo } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { aiApi } from '../api/aiApi';
import { ChatMessageBubble, ChatTypingIndicator } from '../components/chat/ChatMessageBubble';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Mic, Send, Sparkles, Compass, MapPin, X } from 'lucide-react';
import './TripPlanner.css';

// Types for AI module
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RecommendationResult {
  budget_usd: number;
  duration_days: number;
  travelers: number;
  recommendations: string[];
}

export function TripPlanner() {
  const { isAuthenticated } = useAuth();
  
  // Fare Estimator State
  const [fareData, setFareData] = useState({
    from_city: '',
    to_city: '',
    distance_km: '',
    transport_type: 'bus',
    demand: 'medium'
  });
  const [predictedPrice, setPredictedPrice] = useState<string | null>(null);
  const [predictionNote, setPredictionNote] = useState('Enter trip details to generate a local fare estimate.');
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSearchingDistance, setIsSearchingDistance] = useState(false);

  // Trip Planner State
  const [tripData, setTripData] = useState({
    budget_usd: '',
    duration_days: '',
    travelers: ''
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! Ask about routes, prices, or how to use the fare estimator.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatRecording, setIsChatRecording] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Translator State
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [detectedLang, setDetectedLang] = useState('-');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTransRecording, setIsTransRecording] = useState(false);

  // Speech Recognition setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const chatRecognition = useMemo(() => SpeechRecognition ? new SpeechRecognition() : null, [SpeechRecognition]);
  const transRecognition = useMemo(() => SpeechRecognition ? new SpeechRecognition() : null, [SpeechRecognition]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle distance lookup
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (fareData.from_city.trim() && fareData.to_city.trim()) {
        setIsSearchingDistance(true);
        setPredictionNote('Searching route distance...');
        try {
          const result = await aiApi.getRouteDistance(fareData.from_city, fareData.to_city);
          if (result.success) {
            setFareData(prev => ({ ...prev, distance_km: result.distance_km.toString() }));
            setPredictionNote(`Route found: ${result.distance_km} km. Ready to predict.`);
          } else {
            setFareData(prev => ({ ...prev, distance_km: '' }));
            setPredictionNote(result.error || 'Distance not available for this route.');
          }
        } catch (error) {
          setPredictionNote('Error searching for route distance.');
        } finally {
          setIsSearchingDistance(false);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fareData.from_city, fareData.to_city]);

  // Fare Prediction
  const handlePredictFare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fareData.distance_km) return;

    setIsPredicting(true);
    try {
      const result = await aiApi.predictPrice({
        from_city: fareData.from_city,
        to_city: fareData.to_city,
        distance_km: Number(fareData.distance_km),
        transport_type: fareData.transport_type,
        demand: fareData.demand
      });
      setPredictedPrice(`RWF ${Number(result.predicted_price).toLocaleString()}`);
      setPredictionNote(`Estimated fare for ${fareData.from_city} to ${fareData.to_city} by ${fareData.transport_type}.`);
    } catch (error) {
      setPredictedPrice('Unavailable');
      setPredictionNote('Error reaching prediction service.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Trip Generation
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fareData.from_city || !fareData.to_city || !fareData.distance_km) {
      alert("Please fill in the Fare Estimator first to provide your travel route.");
      return;
    }

    setIsGeneratingPlan(true);
    try {
      const result = await aiApi.recommendTrip({
        ...fareData,
        distance_km: Number(fareData.distance_km),
        budget_usd: Number(tripData.budget_usd),
        duration_days: Number(tripData.duration_days),
        travelers: Number(tripData.travelers),
        interests: selectedInterests
      });
      setRecommendations(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setRecommendations(null);
      alert("Failed to generate plan. Please try again later.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Chat Handlers
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsChatLoading(true);

    try {
      const response = await aiApi.chat({
        message: chatMessage,
        history: chatHistory
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'The assistant is temporarily unavailable.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleChatMic = () => {
    if (!chatRecognition) return;
    if (isChatRecording) {
      chatRecognition.stop();
      setIsChatRecording(false);
    } else {
      chatRecognition.start();
      setIsChatRecording(true);
      chatRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatMessage(transcript);
        // We'll let the user review or send manually, 
        // or we could auto-send by calling handleSendChat(transcript)
      };
      chatRecognition.onend = () => setIsChatRecording(false);
    }
  };

  // Translator Handlers
  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setTranslatedText('Translating...');
    setDetectedLang('checking...');

    try {
      // 1. Detect language
      const detectResult = await aiApi.detect(sourceText);
      if (Array.isArray(detectResult) && detectResult.length > 0 && detectResult[0].language) {
        const langMap: Record<string, string> = {
          en: "English", fr: "French", rw: "Kinyarwanda", sw: "Swahili",
          es: "Spanish", de: "German", it: "Italian", pt: "Portuguese",
          ar: "Arabic", ru: "Russian", zh: "Chinese", ja: "Japanese",
        };
        const langCode = detectResult[0].language;
        setDetectedLang(langMap[langCode] || langCode);
      } else {
        setDetectedLang('Unknown');
      }

      // 2. Translate
      const result = await aiApi.translate(sourceText, targetLang);
      if (result.success) {
        setTranslatedText(result.translatedText);
      } else {
        setTranslatedText('Translation failed.');
      }
    } catch (error) {
      setTranslatedText('Translation service unavailable.');
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleTransMic = () => {
    if (!transRecognition) return;
    if (isTransRecording) {
      transRecognition.stop();
      setIsTransRecording(false);
    } else {
      transRecognition.start();
      setIsTransRecording(true);
      transRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSourceText(transcript);
      };
      transRecognition.onend = () => setIsTransRecording(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const interestOptions = [
    'Wildlife & Safaris', 'Culture & History', 'Adventure Sports',
    'Relaxation', 'Photography', 'Local Cuisine'
  ];

  const groupedRecs = useMemo(() => {
    if (!recommendations) return {};
    const categories: Record<string, string[]> = {
      "Recommended Accommodation": [],
      "Suggested Activities": [],
      "Food & Dining": [],
      "Transportation": []
    };

    recommendations.recommendations.forEach(rec => {
      const l = rec.toLowerCase();
      if (l.includes("hotel") || l.includes("guesthouse") || l.includes("backpackers") || l.includes("lodging")) {
        categories["Recommended Accommodation"].push(rec);
      } else if (l.includes("restaurant") || l.includes("food") || l.includes("meal") || l.includes("market")) {
        categories["Food & Dining"].push(rec);
      } else if (l.includes("transport") || l.includes("bus") || l.includes("taxi") || l.includes("route")) {
        categories["Transportation"].push(rec);
      } else {
        categories["Suggested Activities"].push(rec);
      }
    });
    return categories;
  }, [recommendations]);

  const dailyBudget = useMemo(() => {
    if (!recommendations) return 0;
    const { budget_usd, duration_days, travelers } = recommendations;
    return budget_usd && duration_days && travelers 
      ? Math.round(budget_usd / (duration_days * travelers)) 
      : 0;
  }, [recommendations]);

  const handleExportReport = () => {
    if (!recommendations) return;

    const reportContent = `
SURA RWANDA - STRATEGIC TRAVEL REPORT
====================================
Generated by Rwanda Travel AI

TRIP SUMMARY
------------
Route: ${fareData.from_city} to ${fareData.to_city}
Transport: ${fareData.transport_type} (${fareData.demand} demand)
Estimated Fare: ${predictedPrice}
Total Budget: $${recommendations.budget_usd}
Duration: ${recommendations.duration_days} days
Travelers: ${recommendations.travelers}
Daily Budget per Person: $${dailyBudget}

PERSONALIZED RECOMMENDATIONS
----------------------------
${Object.entries(groupedRecs).map(([category, recs]) => `
[${category}]
${recs.map(r => `• ${r}`).join('\n')}
`).join('\n')}

Note: This report is a strategic guide generated based on current AI modeling and historical data.
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sura_Rwanda_Strategy_${fareData.to_city || 'Trip'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f4faf6]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="ai-planner-wrapper">
          <div className="topbar compact-topbar bg-white border border-[#4a907326] shadow-sm rounded-2xl p-4 mb-8 flex items-center gap-4 group">
            <div className="brand-mark relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-lg group">
              <motion.img 
                src="/logo.webp"
                alt="Rwanda Travel AI Logo"
                className="w-full h-full object-contain"
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
            </div>
            <div>
              <p className="eyebrow text-[10px] font-bold text-[#4a9073] uppercase tracking-widest">Smart Mobility Platform</p>
              <h1 className="text-xl font-bold text-[#1b3b2c] font-['Space_Grotesk']">Rwanda Travel AI</h1>
            </div>
          </div>

          <main className="planner-layout">
            <section className="planner-sidebar">
              {/* Fare Estimator */}
              <div className="card planner-card ticket-card">
                <div className="card-head mb-6">
                  <p className="section-tag">Fare Estimator</p>
                  <h3 className="text-lg font-bold text-[#1b3b2c]">Predict a transport price</h3>
                </div>

                <form onSubmit={handlePredictFare} className="form-grid">
                  <label>
                    <span>From District</span>
                    <input 
                      type="text" 
                      placeholder="e.g. Kigali" 
                      required 
                      value={fareData.from_city}
                      onChange={e => setFareData({...fareData, from_city: e.target.value})}
                    />
                  </label>
                  <label>
                    <span>To District</span>
                    <input 
                      type="text" 
                      placeholder="e.g. Musanze" 
                      required 
                      value={fareData.to_city}
                      onChange={e => setFareData({...fareData, to_city: e.target.value})}
                    />
                  </label>
                  <label>
                    <span>Distance (km)</span>
                    <input 
                      type="text" 
                      placeholder={isSearchingDistance ? "Searching..." : "Select route first"} 
                      readOnly 
                      required 
                      value={fareData.distance_km}
                      className={isSearchingDistance ? "loading-pulse" : ""}
                    />
                  </label> 
                  <label>
                    <span>Transport Type</span>
                    <select 
                      required
                      value={fareData.transport_type}
                      onChange={e => setFareData({...fareData, transport_type: e.target.value})}
                    >
                      <option value="bus">Bus</option>
                      <option value="moto">Moto</option>
                      <option value="taxi">Taxi</option>
                      <option value="car">Car</option>
                      <option value="boat">Boat</option>
                    </select>
                  </label>
                  <label>
                    <span>Demand Level</span>
                    <select 
                      required
                      value={fareData.demand}
                      onChange={e => setFareData({...fareData, demand: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="peak">Peak</option>
                    </select>
                  </label>

                  <button className="primary-btn" type="submit" disabled={isPredicting || !fareData.distance_km}>
                    {isPredicting ? "Calculating..." : "Predict Fare"}
                  </button>
                </form>

                <div className="result-panel mt-6 p-4 bg-white border border-gray-100 rounded-xl">
                  <p className="result-label text-[10px] font-bold text-[#4a9073] uppercase">Estimated Fare</p>
                  <p className="result-value text-3xl font-bold text-[#1b3b2c] my-2">{predictedPrice || 'RWF 0'}</p>
                  <p className="result-note text-xs text-[#4e7060] italic">{predictionNote}</p>
                </div>
              </div>

              {/* Trip Parameters */}
              <div className="card planner-card">
                <div className="card-head mb-6">
                  <p className="section-tag">Your Travel Details</p>
                  <h3 className="text-lg font-bold text-[#1b3b2c]">Trip Parameters</h3>
                </div>

                <form onSubmit={handleGeneratePlan} className="planner-form">
                  <label className="flex flex-col gap-2">
                    <span>Total Budget (USD)</span>
                    <input 
                      type="number" 
                      min="0" 
                      placeholder="e.g. 3000" 
                      required 
                      value={tripData.budget_usd}
                      onChange={e => setTripData({...tripData, budget_usd: e.target.value})}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span>Trip Duration (days)</span>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="e.g. 7" 
                      required 
                      value={tripData.duration_days}
                      onChange={e => setTripData({...tripData, duration_days: e.target.value})}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span>Number of Travelers</span>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="e.g. 2" 
                      required 
                      value={tripData.travelers}
                      onChange={e => setTripData({...tripData, travelers: e.target.value})}
                    />
                  </label>
                  
                  <div className="interests-section mt-4">
                    <span className="text-sm font-bold text-[#4e7060] mb-3 block">Your Interests</span>
                    <div className="interests-grid grid grid-cols-2 gap-3">
                      {interestOptions.map(opt => (
                        <button 
                          key={opt}
                          className={`interest-btn text-xs font-medium py-3 px-4 rounded-xl border transition-all ${selectedInterests.includes(opt) ? 'selected bg-[#66c296] text-white border-[#4a9073]' : 'bg-white border-gray-200 text-[#1b3b2c]'}`} 
                          type="button"
                          onClick={() => toggleInterest(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button className="primary-btn generate-btn mt-6 w-full py-4 flex items-center justify-center gap-2" type="submit" disabled={isGeneratingPlan}>
                    {isGeneratingPlan ? (
                      <>⏳ Building Plan...</>
                    ) : (
                      <>✨ Generate My Plan</>
                    )}
                  </button>
                </form>
              </div>
            </section>

            <section className="planner-results">
              {!recommendations && !isGeneratingPlan && (
                <div className="empty-results-state h-[500px] flex flex-col items-center justify-center bg-[#f0fdf4] border-2 border-dashed border-[#bbf7d0] rounded-3xl p-10 text-center">
                  <div className="empty-icon text-5xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-[#1b3b2c]">AI-Powered Recommendations</h3>
                  <p className="text-[#4e7060] max-w-sm mx-auto italic mt-2">Fill in your travel details and let our AI create a personalized trip plan tailored to your needs</p>
                </div>
              )}

              {isGeneratingPlan && (
                <div className="empty-results-state h-[500px] flex flex-col items-center justify-center bg-[#f0fdf4] border-2 border-dashed border-[#bbf7d0] rounded-3xl p-10 text-center">
                  <div className="empty-icon text-5xl mb-4 animate-bounce">⏳</div>
                  <h3 className="text-xl font-bold text-[#1b3b2c]">Building Your Plan...</h3>
                  <p className="text-[#4e7060] max-w-sm mx-auto italic mt-2">Gathering the best recommendations for your trip.</p>
                </div>
              )}
              
              {recommendations && (
                <div className="recommendations-container flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="plan-header-card bg-[#66c296] text-white p-8 rounded-3xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">✓ Your Personalized Plan</h2>
                    <p className="plan-summary text-sm opacity-90 mb-6 italic">Based on ${recommendations.budget_usd} for {recommendations.duration_days} days with {recommendations.travelers} traveler(s)</p>
                    <div className="daily-budget flex flex-col">
                      <span className="text-xs uppercase tracking-widest font-bold opacity-80">Daily budget per person</span>
                      <strong className="text-4xl font-['Space_Grotesk'] mt-1">${dailyBudget}</strong>
                    </div>
                  </div>

                  {Object.entries({
                    "Recommended Accommodation": "🏨",
                    "Suggested Activities": "🎯",
                    "Food & Dining": "🍴",
                    "Transportation": "🚗"
                  }).map(([name, icon]) => {
                    const recs = groupedRecs[name];
                    if (!recs || recs.length === 0) return null;

                    return (
                      <div key={name} className="rec-card bg-white p-6 rounded-3xl border border-[#4a907326] shadow-sm">
                        <div className="rec-card-head flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                          <span className="text-xl">{icon}</span>
                          <h4 className="font-bold text-[#1b3b2c]">{name}</h4>
                        </div>
                        <ul className="rec-list flex flex-col gap-4">
                          {recs.map((text, i) => (
                            <li key={i} className="rec-item flex items-start gap-3 text-sm text-[#4e7060] italic">
                              <span className="rec-item-check text-[#66c296] font-bold">✓</span>
                              <span>{text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}

                  <div className="flex flex-col md:flex-row gap-4">
                    <button className="primary-btn save-itinerary-btn flex-1 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm">
                      Save to My Itinerary →
                    </button>
                    <button 
                      onClick={handleExportReport}
                      className="bg-slate-900 text-white flex-1 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors"
                    >
                      Download Strategy Report ↓
                    </button>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Floating Widgets */}
      <div className="floating-widgets fixed bottom-8 right-8 z-[1000] flex flex-col-reverse gap-5">
        {/* Chatbot Widget */}
        <div className="chatbot-widget relative flex flex-col items-center">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="chatbot-panel active absolute bottom-20 right-0 flex h-[520px] w-[348px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[2rem] border border-[#4a907326] bg-white shadow-2xl"
              >
                <div className="chatbot-header flex items-center justify-between bg-gradient-to-br from-[#66c296] to-[#4a9073] px-4 py-3.5 text-white font-bold">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 shadow-md shadow-emerald-950/10 backdrop-blur">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="font-['Space_Grotesk'] text-[15px] leading-none">AI Assistant</span>
                      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-50/75">Live route guidance</p>
                    </div>
                  </div>
                  <button
                    className="chatbot-close flex h-8.5 w-8.5 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold transition-colors hover:bg-white/25"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="chatbot-body flex h-full flex-col bg-slate-50/90">
                  <div className="chat-window min-h-0 flex-1 overflow-y-auto px-4 py-5" ref={chatWindowRef}>
                    {chatHistory.map((msg, i) => (
                      <ChatMessageBubble key={i} role={msg.role} content={msg.content} />
                    ))}
                    <AnimatePresence>{isChatLoading && <ChatTypingIndicator />}</AnimatePresence>
                  </div>
                  <form onSubmit={handleSendChat} className="chat-form border-t border-slate-100 bg-white px-4 pb-4 pt-3">
                    <div className="flex gap-2">
                      <div className="chat-input-wrapper relative flex-1">
                      <input 
                        type="text" 
                        placeholder={isChatRecording ? "Listening..." : "Type a message..."}
                        required 
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-[13px] text-slate-700 shadow-inner shadow-slate-100 transition-all focus:border-[#66c296] focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className={`chat-mic-btn absolute right-2 top-1/2 flex h-8.5 w-8.5 -translate-y-1/2 items-center justify-center rounded-xl text-[#4a9073] transition-all hover:bg-emerald-50 ${isChatRecording ? 'animate-pulse text-red-500' : ''}`}
                        onClick={toggleChatMic}
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                    </div>
                      <button
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#66c296] to-[#4a9073] text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        type="submit"
                        disabled={isChatLoading || !chatMessage.trim()}
                      >
                        {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isChatOpen && !isTranslatorOpen && (
            <button className="chatbot-toggle w-[60px] h-[60px] rounded-full bg-[#66c296] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110" onClick={() => setIsChatOpen(true)}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 2.02.6 3.9 1.63 5.48L2.05 22.1c-.13.39.24.76.63.63l4.62-1.58C8.88 21.79 10.4 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.47 0-2.87-.36-4.11-1l-.29-.15-3.08 1.05 1.05-3.08-.15-.29c-.64-1.24-1-2.64-1-4.11 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>

        {/* Translator Widget */}
        <div className="translator-widget relative flex flex-col items-center">
          <AnimatePresence>
            {isTranslatorOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="translator-panel active absolute bottom-20 right-0 w-[360px] bg-white rounded-3xl shadow-2xl border border-[#4a907326] overflow-hidden flex flex-col"
              >
                <div className="translator-header p-5 flex justify-between items-center bg-gradient-to-br from-[#66c296] to-[#4a9073] text-white font-bold">
                  <span className="font-['Space_Grotesk']">Universal Translator</span>
                  <button className="translator-close w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold" onClick={() => setIsTranslatorOpen(false)}>X</button>
                </div>
                <div className="translator-body p-5">
                  <form onSubmit={handleTranslate} className="translate-form flex flex-col gap-4">
                    <div className="lang-selectors flex gap-3">
                      <div className="lang-group flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-[#4e7060] uppercase">From:</label>
                        <input type="text" value="Auto Detect" disabled className="bg-gray-50 text-xs py-2 px-3 rounded-lg border border-gray-100" />
                      </div>
                      <div className="lang-group flex-1 flex flex-col gap-1">
                        <label htmlFor="target-lang" className="text-[10px] font-bold text-[#4e7060] uppercase">To:</label>
                        <select 
                          id="target-lang" 
                          className="text-xs py-2 px-3 rounded-lg border border-gray-200"
                          value={targetLang}
                          onChange={e => setTargetLang(e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="rw">Kinyarwanda</option>
                          <option value="sw">Swahili</option>
                          <option value="es">Spanish</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="pt">Portuguese</option>
                          <option value="ar">Arabic</option>
                          <option value="ru">Russian</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>
                    </div>

                    <div className="translate-areas flex flex-col gap-3">
                      <div className="textarea-wrapper relative">
                        <textarea 
                          placeholder={isTransRecording ? "Listening..." : "Type or speak to translate..."} 
                          required
                          className="w-full min-h-[120px] p-4 pr-12 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#66c296] resize-none"
                          value={sourceText}
                          onChange={e => setSourceText(e.target.value)}
                        ></textarea>
                        <button 
                          type="button" 
                          className={`mic-btn absolute right-3 top-3 w-9 h-9 rounded-full bg-[#e5f5ea] flex items-center justify-center text-[#4a9073] transition-all ${isTransRecording ? 'bg-red-500 text-white animate-pulse' : ''}`}
                          onClick={toggleTransMic}
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                          </svg>
                        </button>
                      </div>
                      <div className="translated-box min-h-[80px] p-4 bg-[#f4faf6] border border-[#4a907326] rounded-2xl flex flex-col gap-1">
                        <p className="detected-language text-[10px] font-bold text-[#4a9073] uppercase tracking-widest">Detected language: {detectedLang}</p>
                        <p className={`text-sm italic ${!translatedText ? 'text-[#4e7060] opacity-60' : 'text-[#1b3b2c]'}`}>
                          {translatedText || 'Translation will appear here...'}
                        </p>
                      </div>
                    </div>

                    <button className="primary-btn bg-[#66c296] text-white py-4 rounded-xl font-bold shadow-lg" type="submit" disabled={isTranslating}>
                      {isTranslating ? "Translating..." : "Translate"}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isChatOpen && !isTranslatorOpen && (
            <button className="translator-toggle w-[60px] h-[60px] rounded-full bg-[#66c296] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110" onClick={() => setIsTranslatorOpen(true)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l6 6"></path>
                <path d="M4 14h16"></path>
                <path d="M2 5h12"></path>
                <path d="M7 2h1"></path>
                <path d="M22 22l-5-10-5 10"></path>
                <path d="M14 18h6"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

