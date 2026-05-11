import React, { useState, useEffect, useRef } from 'react';
import { Building2, Home, MapPin, Ruler, Bed, Bath, Layers, Calendar, Car, Sofa, GraduationCap, Hospital, TrendingUp, Search, Info, Send, X, Bot, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { AI_API_BASE_URL } from '../api/aiApi';
import { ChatMessageBubble, ChatTypingIndicator } from '../components/chat/ChatMessageBubble';
import { buildRwandaRealEstateContext } from '../data/rwandaRealEstateMarket';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Housing() {
  const housingMarketContext = buildRwandaRealEstateContext();
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [housingType, setHousingType] = useState<'buy' | 'rent'>('buy');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Sura Rwanda Housing Assistant. How can I help you with your property search today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    location: '',
    size_sqm: '',
    bedrooms: '2',
    bathrooms: '1',
    floors: '1',
    age_years: '0',
    parking: '1',
    furnished: false,
    distance_to_city_km: '',
    nearby_schools: '1',
    nearby_hospitals: '1'
  });

  // Scroll animations for cards
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300, 500], [1, 0.5, 0.2]);

  useEffect(() => {
    fetchHousingLocations();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchHousingLocations = async () => {
    try {
      const response = await fetch(`${AI_API_BASE_URL}/housing-locations`);
      const data = await response.json();
      if (data.locations) {
        setLocations(data.locations.sort());
      }
    } catch (error) {
      console.error('Error fetching housing locations:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, furnished: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      location: formData.location,
      size_sqm: parseFloat(formData.size_sqm),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      floors: parseInt(formData.floors),
      age_years: parseInt(formData.age_years),
      parking: parseInt(formData.parking),
      furnished: formData.furnished ? 1 : 0,
      distance_to_city_km: parseFloat(formData.distance_to_city_km),
      nearby_schools: parseInt(formData.nearby_schools),
      nearby_hospitals: parseInt(formData.nearby_hospitals)
    };

    try {
      const response = await fetch(`${AI_API_BASE_URL}/predict-housing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.predicted_price) {
        let finalPrice = result.predicted_price;
        if (housingType === 'rent') {
          finalPrice = finalPrice * 0.005; // 0.5% for rent estimate
        }
        setPredictedPrice(finalPrice);
      } else if (result.error) {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error('Error predicting housing price:', error);
      alert('Failed to connect to AI service. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const newUserMessage: Message = { role: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await fetch(`${AI_API_BASE_URL}/housing-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${housingMarketContext}\n\nUser question:\n${inputMessage}`,
          history: chatMessages.map(m => ({ role: m.role, content: m.content })),
          property_context: predictedPrice ? {
            ...formData,
            predicted_price: predictedPrice,
            type: housingType
          } : null
        })
      });

      const data = await response.json();
      if (data.response) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my AI brain. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navigation />
      <main className="flex-grow bg-slate-50/50 pb-20">
        {/* Hero Section */}
        <div className="bg-white border-b border-slate-200 py-6 mb-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Find Your Perfect Home in <span className="text-primary">Rwanda</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Whether you're looking to book a luxury apartment or buy a permanent house, 
              our AI predicts the fair market value based on current real estate trends.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-8">
              <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Search className="w-6 h-6 text-primary" />
                        Property Details
                      </CardTitle>
                      <CardDescription>Enter details to get an instant AI valuation</CardDescription>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                      <button
                        onClick={() => { setHousingType('buy'); setPredictedPrice(null); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                          housingType === 'buy' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Buy House
                      </button>
                      <button
                        onClick={() => { setHousingType('rent'); setPredictedPrice(null); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                          housingType === 'rent' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Rent Apartment
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Location & Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="location" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" /> Location
                        </Label>
                        <Select onValueChange={(v) => handleSelectChange('location', v)} required>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary">
                            <SelectValue placeholder="Select District" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map(loc => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="size_sqm" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-primary" /> Size (sqm)
                        </Label>
                        <Input
                          id="size_sqm"
                          name="size_sqm"
                          type="number"
                          placeholder="e.g. 150"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.size_sqm}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Rooms & Floors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="bedrooms" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Bed className="w-4 h-4 text-primary" /> Bedrooms
                        </Label>
                        <Input
                          id="bedrooms"
                          name="bedrooms"
                          type="number"
                          min="1"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="bathrooms" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Bath className="w-4 h-4 text-primary" /> Bathrooms
                        </Label>
                        <Input
                          id="bathrooms"
                          name="bathrooms"
                          type="number"
                          min="1"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="floors" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-primary" /> Floors
                        </Label>
                        <Input
                          id="floors"
                          name="floors"
                          type="number"
                          min="1"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.floors}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Age & Parking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="age_years" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" /> Age of Property (Years)
                        </Label>
                        <Input
                          id="age_years"
                          name="age_years"
                          type="number"
                          min="0"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.age_years}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="parking" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary" /> Parking Spaces
                        </Label>
                        <Input
                          id="parking"
                          name="parking"
                          type="number"
                          min="0"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.parking}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <Checkbox 
                        id="furnished" 
                        checked={formData.furnished}
                        onCheckedChange={handleCheckboxChange}
                        className="w-5 h-5 border-slate-300 data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="furnished" className="text-sm font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                        <Sofa className="w-4 h-4 text-primary" /> Furnished Property
                      </Label>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="distance_to_city_km" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Distance to City Center (km)
                      </Label>
                      <Input
                        id="distance_to_city_km"
                        name="distance_to_city_km"
                        type="number"
                        step="0.1"
                        placeholder="e.g. 5.5"
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                        value={formData.distance_to_city_km}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="nearby_schools" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" /> Nearby Schools
                        </Label>
                        <Input
                          id="nearby_schools"
                          name="nearby_schools"
                          type="number"
                          min="0"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.nearby_schools}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="nearby_hospitals" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Hospital className="w-4 h-4 text-primary" /> Nearby Hospitals
                        </Label>
                        <Input
                          id="nearby_hospitals"
                          name="nearby_hospitals"
                          type="number"
                          min="0"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary"
                          value={formData.nearby_hospitals}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing Market Data...
                        </div>
                      ) : (
                        `Predict ${housingType === 'buy' ? 'Market Value' : 'Monthly Rent'}`
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Result Column */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden sticky top-28 z-20">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Market Value
                  </div>
                  
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">
                    Estimated {housingType === 'buy' ? 'Purchase Price' : 'Monthly Rent'}
                  </p>
                  
                  <div className="flex items-baseline justify-center gap-2 mb-8">
                    <span className="text-2xl font-bold text-slate-500">USD</span>
                    <span className="text-6xl font-black tracking-tighter">
                      {predictedPrice ? predictedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                    </span>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-left mb-8">
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "Market valuation based on property size, location demand index, 
                      proximity to amenities, and historical real estate growth in Rwanda."
                    </p>
                  </div>

                  <div className="w-full">
                    <Button 
                      onClick={() => setIsChatOpen(true)}
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
                    >
                      Contact Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="relative">
                <motion.div 
                  className="grid grid-cols-1 gap-4 z-10 relative"
                  style={{ y: y1, opacity }}
                >
                  <Card className="border-none shadow-lg shadow-slate-200/50">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Trend</p>
                        <p className="text-lg font-black text-slate-900">+4.2% Annual Growth</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 gap-4 mt-4 z-10 relative"
                  style={{ y: y2, opacity }}
                >
                  <Card className="border-none shadow-lg shadow-slate-200/50">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Home className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Area</p>
                        <p className="text-lg font-black text-slate-900">Nyarutarama</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 gap-4 mt-4 z-10 relative"
                  style={{ y: y3, opacity }}
                >
                  <Card className="border-none shadow-lg shadow-slate-200/50">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <Info className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note</p>
                        <p className="text-sm text-slate-600">Prices are estimates based on market data.</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chatbot in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl max-[420px]:w-[calc(100vw-2rem)]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 shadow-lg shadow-black/10 backdrop-blur">
                    <Sparkles className="h-5 w-5 text-emerald-200" />
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                      <Bot className="h-5 w-5 text-emerald-200" />
                      Housing AI Assistant
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100/70">
                      Market-aware property help
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-2xl p-2 transition-colors hover:bg-white/10"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex-grow space-y-4 overflow-y-auto bg-slate-50/80 px-4 py-5">
                {chatMessages.map((m, idx) => (
                  <ChatMessageBubble key={idx} role={m.role} content={m.content} />
                ))}
                <AnimatePresence>{isChatLoading && <ChatTypingIndicator />}</AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-slate-100 bg-white p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about properties..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="rounded-2xl border-slate-200 bg-slate-50 px-4 py-6 text-sm shadow-inner shadow-slate-100 focus:border-primary focus:ring-4 focus:ring-emerald-100"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isChatLoading || !inputMessage.trim()}
                    className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.03] active:scale-95"
                  >
                    {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Chat Toggle Button (Optional, but good for UX) */}
        {!isChatOpen && (
          <Button 
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 flex items-center justify-center"
          >
            <Bot className="w-7 h-7 text-white" />
          </Button>
        )}
      </div>

      <Footer />
    </div>
  );
}
