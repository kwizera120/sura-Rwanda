const predictForm = document.querySelector("#predict-form");
const fromDistrictInput = document.querySelector("#from-district");
const toDistrictInput = document.querySelector("#to-district");
const distanceKmInput = document.querySelector("#distance-km");
const predictBtn = predictForm ? predictForm.querySelector('button[type="submit"]') : null;

const predictionResult = document.querySelector("#prediction-result");
const predictionNote = document.querySelector("#prediction-note");
const predictStatus = document.querySelector("#predict-status");

const tripPlanForm = document.querySelector("#trip-plan-form");
const tripStatus = document.querySelector("#trip-status");
const interestButtons = document.querySelectorAll(".interest-btn");
const selectedInterests = new Set();

// Voice Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const chatForm = document.querySelector("#chat-form");
const chatWindow = document.querySelector("#chat-window");
const chatbotPanel = document.querySelector("#chatbot-panel");
const chatbotToggle = document.querySelector("#chatbot-toggle");
const chatbotClose = document.querySelector("#chatbot-close");
const chatMicBtn = document.querySelector("#chat-mic-btn");
let isChatRecording = false;

// Voice Recognition for Chatbot
if (SpeechRecognition && chatMicBtn) {
  const chatRecognition = new SpeechRecognition();
  chatRecognition.continuous = false;
  chatRecognition.interimResults = false;
  chatRecognition.lang = 'en-US';

  chatRecognition.onstart = () => {
    isChatRecording = true;
    chatMicBtn.classList.add("recording");
    if (chatForm) chatForm.elements.message.placeholder = "Listening...";
  };

  chatRecognition.onend = () => {
    isChatRecording = false;
    chatMicBtn.classList.remove("recording");
    if (chatForm) chatForm.elements.message.placeholder = "Type a message...";
  };

  chatRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (chatForm) {
      chatForm.elements.message.value = transcript;
      chatForm.dispatchEvent(new Event("submit"));
    }
  };

  chatMicBtn.addEventListener("click", () => {
    if (isChatRecording) {
      chatRecognition.stop();
    } else {
      chatRecognition.start();
    }
  });
}

const chatHistory = [
  {
    role: "assistant",
    content: "Hello! I am your Rwanda Travel & Housing AI assistant. Ask me about routes, fare estimates, or finding your perfect home in Rwanda!",
  },
];

// Render initial message
window.addEventListener('DOMContentLoaded', () => {
  if (chatHistory.length > 0) {
    appendMessage(chatHistory[0].role, chatHistory[0].content);
  }
  if (window.lucide) {
    lucide.createIcons();
  }
});

const translatorPanel = document.querySelector("#translator-panel");
const translatorToggle = document.querySelector("#translator-toggle");
const translatorClose = document.querySelector("#translator-close");
const translateForm = document.querySelector("#translate-form");
const targetLangSelect = document.querySelector("#target-lang");
const sourceText = document.querySelector("#source-text");
const translatedTextContainer = document.querySelector("#translated-text");
const detectedLanguageEl = document.querySelector("#detected-language");
const micBtn = document.querySelector("#mic-btn");
let isTranslating = false;
let isRecording = false;

// Voice Recognition logic for Translator
let recognition;

if (SpeechRecognition && micBtn) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add("recording");
    if (sourceText) sourceText.placeholder = "Listening...";
  };

  recognition.onend = () => {
    isRecording = false;
    micBtn.classList.remove("recording");
    if (sourceText) sourceText.placeholder = "Type or speak to translate...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (sourceText) sourceText.value = transcript;
    performHostedTranslation(transcript, targetLangSelect.value);
  };

  recognition.onerror = () => {
    isRecording = false;
    micBtn.classList.remove("recording");
    if (sourceText) sourceText.placeholder = "Speech recognition error. Try typing.";
  };

  micBtn.addEventListener("click", () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
}

// New Trip Planner elements
const recommendationsContainer = document.querySelector("#recommendations-container");
const emptyResultsState = document.querySelector("#empty-results-state");

function setStatus(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function appendMessage(role, text) {
  if (!chatWindow) return;
  
  const isAI = role === "ai" || role === "assistant";
  
  // Extract property data if present
  let propertyData = null;
  let cleanText = text;
  const propertyMatch = text.match(/\[PROPERTY_DATA\]([\s\S]*?)\[\/PROPERTY_DATA\]/);
  
  if (propertyMatch) {
    try {
      propertyData = JSON.parse(propertyMatch[1].trim());
      cleanText = text.replace(/\[PROPERTY_DATA\][\s\S]*?\[\/PROPERTY_DATA\]/, '').trim();
    } catch (e) {
      console.error("Failed to parse property data", e);
    }
  }

  const article = document.createElement("article");
  article.className = `flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`;

  const container = document.createElement("div");
  container.className = `flex max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'} items-start gap-3`;

  const iconDiv = document.createElement("div");
  iconDiv.className = `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-brand text-white' : 'bg-gray-200 text-gray-600'}`;
  iconDiv.innerHTML = isAI ? '<i data-lucide="bot" class="w-5 h-5"></i>' : '<i data-lucide="user" class="w-5 h-5"></i>';

  const contentWrapper = document.createElement("div");
  contentWrapper.className = `flex flex-col ${isAI ? 'items-start' : 'items-end'} gap-2`;

  const bubble = document.createElement("div");
  bubble.className = `px-4 py-3 rounded-2xl shadow-sm ${
    isAI 
      ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
      : 'bg-brand text-white rounded-tr-none'
  }`;

  const body = document.createElement("div");
  body.className = `prose prose-sm max-w-none ${isAI ? 'text-gray-800' : 'text-white prose-invert'} 
    prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-strong:font-bold`;
  body.innerHTML = marked.parse(cleanText);

  bubble.appendChild(body);
  contentWrapper.appendChild(bubble);

  // Render Housing Card if data exists
  if (propertyData) {
    const card = document.createElement("div");
    card.className = "bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md max-w-sm hover:shadow-lg transition-shadow duration-300";
    card.innerHTML = `
      <div class="h-40 bg-gray-200 relative overflow-hidden">
        <img src="${propertyData.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}" 
             alt="${propertyData.title}" class="w-full h-full object-cover">
        <div class="absolute top-2 right-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded">
          ${propertyData.price}
        </div>
      </div>
      <div class="p-4">
        <h4 class="font-bold text-gray-800 text-base mb-1">${propertyData.title}</h4>
        <div class="flex items-center text-gray-500 text-xs mb-3">
          <i data-lucide="map-pin" class="w-3 h-3 mr-1"></i>
          ${propertyData.location}
        </div>
        <div class="flex items-center gap-4 border-t pt-3">
          <div class="flex items-center text-gray-600 text-xs">
            <i data-lucide="bed" class="w-4 h-4 mr-1 text-brand"></i>
            ${propertyData.bedrooms} Bed
          </div>
          <div class="flex items-center text-gray-600 text-xs">
            <i data-lucide="bath" class="w-4 h-4 mr-1 text-brand"></i>
            ${propertyData.bathrooms} Bath
          </div>
        </div>
        <button class="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-brand font-bold py-2 rounded-lg text-sm transition-colors">
          View Details
        </button>
      </div>
    `;
    contentWrapper.appendChild(card);
  }

  const time = document.createElement("span");
  time.className = "text-[10px] text-gray-400 mt-1 px-1";
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  contentWrapper.appendChild(time);

  container.appendChild(iconDiv);
  container.appendChild(contentWrapper);
  article.appendChild(container);
  
  chatWindow.appendChild(article);
  if (window.lucide) lucide.createIcons();
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  if (!chatWindow) return;
  const indicator = document.createElement("div");
  indicator.id = "typing-indicator";
  indicator.className = "flex justify-start mb-6 animate-in fade-in duration-200";
  indicator.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
        <i data-lucide="bot" class="w-5 h-5"></i>
      </div>
      <div class="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
        <div class="flex gap-1">
          <span class="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
          <span class="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span class="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
    </div>
  `;
  chatWindow.appendChild(indicator);
  if (window.lucide) lucide.createIcons();
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

function renderRecommendations(result) {
  if (!recommendationsContainer || !emptyResultsState) return;

  if (!result || !result.recommendations || result.recommendations.length === 0) {
    emptyResultsState.style.display = "flex";
    recommendationsContainer.style.display = "none";
    return;
  }

  emptyResultsState.style.display = "none";
  recommendationsContainer.style.display = "flex";
  recommendationsContainer.innerHTML = "";

  const { budget_usd, duration_days, travelers, recommendations } = result;
  const dailyBudget = budget_usd && duration_days && travelers 
    ? Math.round(budget_usd / (duration_days * travelers)) 
    : 0;

  // Modern Assistant Style Header
  const headerCard = document.createElement("div");
  headerCard.className = "w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-brand/5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500";
  headerCard.innerHTML = `
    <div class="flex items-start justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
          <i data-lucide="sparkles" class="w-6 h-6"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Your AI Itinerary</h2>
          <p class="text-sm text-gray-500">Personalized travel plan for your trip</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs font-bold text-brand uppercase tracking-wider mb-1">Daily Budget</div>
        <div class="text-3xl font-black text-gray-800">$${dailyBudget}</div>
        <div class="text-[10px] text-gray-400 font-medium">per person / day</div>
      </div>
    </div>
    
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
        <div class="text-gray-400 mb-1 flex items-center gap-2">
          <i data-lucide="wallet" class="w-3 h-3"></i>
          <span class="text-[10px] font-bold uppercase tracking-widest">Total Budget</span>
        </div>
        <div class="text-lg font-bold text-gray-700">$${budget_usd}</div>
      </div>
      <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
        <div class="text-gray-400 mb-1 flex items-center gap-2">
          <i data-lucide="calendar" class="w-3 h-3"></i>
          <span class="text-[10px] font-bold uppercase tracking-widest">Duration</span>
        </div>
        <div class="text-lg font-bold text-gray-700">${duration_days} Days</div>
      </div>
      <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
        <div class="text-gray-400 mb-1 flex items-center gap-2">
          <i data-lucide="users" class="w-3 h-3"></i>
          <span class="text-[10px] font-bold uppercase tracking-widest">Travelers</span>
        </div>
        <div class="text-lg font-bold text-gray-700">${travelers} People</div>
      </div>
    </div>
  `;
  recommendationsContainer.appendChild(headerCard);

  // Categories with matching icons
  const categories = {
    "Recommended Accommodation": { icon: "hotel", color: "blue" },
    "Suggested Activities": { icon: "map-pin", color: "orange" },
    "Food & Dining": { icon: "utensils", color: "red" },
    "Transportation": { icon: "car", color: "green" }
  };

  const groupedRecs = {
    "Recommended Accommodation": [],
    "Suggested Activities": [],
    "Food & Dining": [],
    "Transportation": []
  };

  recommendations.forEach(rec => {
    const l = rec.toLowerCase();
    if (l.includes("hotel") || l.includes("guesthouse") || l.includes("backpackers") || l.includes("lodging") || l.includes("lodge")) {
      groupedRecs["Recommended Accommodation"].push(rec);
    } else if (l.includes("restaurant") || l.includes("food") || l.includes("meal") || l.includes("market") || l.includes("dining")) {
      groupedRecs["Food & Dining"].push(rec);
    } else if (l.includes("transport") || l.includes("bus") || l.includes("taxi") || l.includes("route") || l.includes("moto")) {
      groupedRecs["Transportation"].push(rec);
    } else {
      groupedRecs["Suggested Activities"].push(rec);
    }
  });

  // Render Category Cards in a modern grid
  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8";
  
  Object.entries(categories).forEach(([name, config]) => {
    const recs = groupedRecs[name];
    if (recs.length === 0) return;

    const card = document.createElement("div");
    card.className = "bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-in fade-in zoom-in-95 duration-500";
    
    let itemsHtml = recs.map(text => `
      <div class="flex items-start gap-3 group">
        <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand/40 group-hover:bg-brand transition-colors"></div>
        <p class="text-sm text-gray-600 leading-relaxed">${text}</p>
      </div>
    `).join("");

    card.innerHTML = `
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
          <i data-lucide="${config.icon}" class="w-5 h-5"></i>
        </div>
        <h4 class="font-bold text-gray-800">${name}</h4>
      </div>
      <div class="space-y-4">
        ${itemsHtml}
      </div>
    `;
    grid.appendChild(card);
  });
  
  recommendationsContainer.appendChild(grid);

  // Footer Actions
  const footer = document.createElement("div");
  footer.className = "flex items-center justify-between bg-white/50 backdrop-blur-sm border border-white p-4 rounded-3xl";
  footer.innerHTML = `
    <p class="text-xs text-gray-400 font-medium px-4 italic">This plan was generated using local data and Groq AI</p>
    <button class="bg-brand hover:bg-brand-deep text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2 group">
      Save Itinerary 
      <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
    </button>
  `;
  recommendationsContainer.appendChild(footer);

  // Refresh icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Auto-fetch distance logic
async function fetchRouteDistance() {
  if (!fromDistrictInput || !toDistrictInput || !distanceKmInput) return;
  const fromCity = fromDistrictInput.value.trim();
  const toCity = toDistrictInput.value.trim();

  if (!fromCity || !toCity) return;

  // Show loading feedback
  distanceKmInput.value = "Searching...";
  distanceKmInput.classList.add("loading-pulse");
  if (predictBtn) predictBtn.disabled = true;

  try {
    const response = await fetch("/get-route-distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from_city: fromCity, to_city: toCity }),
    });

    const result = await response.json();

    if (result.success) {
      distanceKmInput.value = result.distance_km;
      distanceKmInput.placeholder = "";
      if (predictBtn) predictBtn.disabled = false;
      if (predictionNote) predictionNote.textContent = `Route found: ${result.distance_km} km. Ready to predict.`;
    } else {
      distanceKmInput.value = "";
      distanceKmInput.placeholder = result.error || "Route not found";
      if (predictionNote) predictionNote.textContent = result.error || "Distance not available for this route.";
      if (predictBtn) predictBtn.disabled = true;
    }
  } catch (error) {
    distanceKmInput.value = "";
    distanceKmInput.placeholder = "Lookup error";
    if (predictionNote) predictionNote.textContent = "Error searching for route distance.";
    if (predictBtn) predictBtn.disabled = true;
  } finally {
    distanceKmInput.classList.remove("loading-pulse");
  }
}

let debounceTimer;
function debouncedFetchDistance() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchRouteDistance, 500); 
}

if (fromDistrictInput) fromDistrictInput.addEventListener("input", debouncedFetchDistance);
if (toDistrictInput) toDistrictInput.addEventListener("input", debouncedFetchDistance);
if (fromDistrictInput) fromDistrictInput.addEventListener("blur", fetchRouteDistance); 
if (toDistrictInput) toDistrictInput.addEventListener("blur", fetchRouteDistance);

// Event Listeners
interestButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.interest;
    if (selectedInterests.has(value)) {
      selectedInterests.delete(value);
      button.classList.remove("selected");
    } else {
      selectedInterests.add(value);
      button.classList.add("selected");
    }
  });
});

if (predictForm) {
  predictForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(predictStatus, "Calculating");

    const formData = new FormData(predictForm);
    const payload = Object.fromEntries(formData.entries());
    payload.distance_km = Number(payload.distance_km);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Prediction request failed");

      const result = await response.json();
      if (predictionResult) predictionResult.textContent = `RWF ${Number(result.predicted_price).toLocaleString()}`;
      if (predictionNote) predictionNote.textContent = `Estimated fare for ${payload.from_city} to ${payload.to_city} by ${payload.transport_type}.`;
      setStatus(predictStatus, "Complete");
    } catch (error) {
      if (predictionResult) predictionResult.textContent = "Unavailable";
      if (predictionNote) predictionNote.textContent = "Error reaching prediction service.";
      setStatus(predictStatus, "Error");
    }
  });
}

if (tripPlanForm) {
  tripPlanForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const predictData = predictForm ? Object.fromEntries(new FormData(predictForm).entries()) : {};
    const tripData = Object.fromEntries(new FormData(tripPlanForm).entries());

    const payload = {
      from_city: predictData.from_city,
      to_city: predictData.to_city,
      distance_km: Number(predictData.distance_km || 0),
      transport_type: predictData.transport_type,
      demand: predictData.demand,
      budget_usd: tripData.budget_usd ? Number(tripData.budget_usd) : null,
      duration_days: tripData.duration_days ? Number(tripData.duration_days) : null,
      travelers: tripData.travelers ? Number(tripData.travelers) : null,
      interests: Array.from(selectedInterests),
    };

    if (!payload.from_city || !payload.to_city || !payload.distance_km) {
      alert("Please fill in the Fare Estimator (at the top) first to provide your travel route.");
      return;
    }

    if (emptyResultsState) {
      emptyResultsState.innerHTML = `
        <div class="empty-icon">⏳</div>
        <h3>Building Your Plan...</h3>
        <p>Gathering the best recommendations for your trip.</p>
      `;
    }

    try {
      const response = await fetch("/recommend-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Recommendation request failed");

      const result = await response.json();
      renderRecommendations(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      renderRecommendations(null);
      if (emptyResultsState) {
        emptyResultsState.innerHTML = `
          <div class="empty-icon">❌</div>
          <h3>Failed to generate plan</h3>
          <p>Service unavailable. Please try again later.</p>
        `;
      }
    }
  });
}

if (chatForm) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = chatForm.elements.message;
    const message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    chatHistory.push({ role: "user", content: message });
    input.value = "";
    showTypingIndicator();

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: chatHistory.slice(0, -1),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const result = await response.json();
      hideTypingIndicator();
      appendMessage("ai", result.response);
      chatHistory.push({ role: "assistant", content: result.response });
    } catch (error) {
      hideTypingIndicator();
      appendMessage("ai", "The assistant is temporarily unavailable.");
    }
  });
}

// Floating Widget Toggles
if (chatbotToggle && chatbotPanel && translatorPanel) {
  chatbotToggle.addEventListener("click", () => {
    chatbotPanel.classList.add("active");
    translatorPanel.classList.remove("active"); 
    // Hide both toggles when chatbot is open
    chatbotToggle.classList.add("hidden");
    translatorToggle.classList.add("hidden");
  });
}

if (chatbotClose && chatbotPanel) {
  chatbotClose.addEventListener("click", () => {
    chatbotPanel.classList.remove("active");
    // Re-show both toggles when chatbot is closed
    chatbotToggle.classList.remove("hidden");
    translatorToggle.classList.remove("hidden");
  });
}

if (translatorToggle && translatorPanel && chatbotPanel) {
  translatorToggle.addEventListener("click", () => {
    translatorPanel.classList.add("active");
    chatbotPanel.classList.remove("active"); 
    // Hide both toggles when translator is open
    chatbotToggle.classList.add("hidden");
    translatorToggle.classList.add("hidden");
  });
}

if (translatorClose && translatorPanel) {
  translatorClose.addEventListener("click", () => {
    translatorPanel.classList.remove("active");
    // Re-show both toggles when translator is closed
    chatbotToggle.classList.remove("hidden");
    translatorToggle.classList.remove("hidden");
  });
}

if (translateForm) {
  translateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = sourceText.value.trim();
    if (!text) return;
    await performHostedTranslation(text, targetLangSelect.value);
  });
}

if (targetLangSelect) {
  targetLangSelect.addEventListener("change", async () => {
    const text = sourceText.value.trim();
    if (!text || isTranslating) return;
    await performHostedTranslation(text, targetLangSelect.value);
  });
}

async function performHostedTranslation(text, targetLang) {
  if (!translatedTextContainer || !detectedLanguageEl) return;
  
  translatedTextContainer.textContent = "Translating...";
  translatedTextContainer.classList.add("placeholder-text");
  detectedLanguageEl.textContent = "Detected language: checking...";
  isTranslating = true;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const detectResponse = await fetch("/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
      signal: controller.signal,
    });

    if (detectResponse.ok) {
      const detectResult = await detectResponse.json();
      if (Array.isArray(detectResult) && detectResult.length > 0 && detectResult[0].language) {
        const langMap = {
          en: "English", fr: "French", rw: "Kinyarwanda", sw: "Swahili",
          es: "Spanish", de: "German", it: "Italian", pt: "Portuguese",
          ar: "Arabic", ru: "Russian", zh: "Chinese", ja: "Japanese",
        };
        const langCode = detectResult[0].language;
        const langName = langMap[langCode] || langCode;
        detectedLanguageEl.textContent = `Detected language: ${langName}`;
      } else {
        detectedLanguageEl.textContent = "Detected language: unknown";
      }
    }

    const translateResponse = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        source_lang: "auto",
        target_lang: targetLang,
      }),
      signal: controller.signal,
    });

    if (!translateResponse.ok) throw new Error("Translation request failed");

    const translateResult = await translateResponse.json();
    if (translateResult.success && translateResult.translatedText) {
      translatedTextContainer.textContent = translateResult.translatedText;
      translatedTextContainer.classList.remove("placeholder-text");
    } else {
      throw new Error(translateResult.error || "Translation failed");
    }
  } catch (error) {
    translatedTextContainer.textContent = "Translation service unavailable.";
    translatedTextContainer.classList.add("placeholder-text");
    detectedLanguageEl.textContent = "Detected language: unavailable";
  } finally {
    clearTimeout(timeout);
    isTranslating = false;
  }
}
