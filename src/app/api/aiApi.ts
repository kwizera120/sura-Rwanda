const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  history?: { role: string; content: string }[];
}

export interface PredictRequest {
  from_city: string;
  to_city: string;
  distance_km: number;
  transport_type: string;
  demand: string;
}

export interface TripRecommendationRequest {
  from_city: string;
  to_city: string;
  distance_km: number;
  transport_type: string;
  demand: string;
  budget_usd?: number;
  duration_days?: number;
  travelers?: number;
  interests: string[];
}

export const aiApi = {
  chat: async (data: ChatRequest) => {
    const response = await fetch(`${AI_API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  predictPrice: async (data: PredictRequest) => {
    const response = await fetch(`${AI_API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getRouteDistance: async (from_city: string, to_city: string) => {
    const response = await fetch(`${AI_API_BASE_URL}/get-route-distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_city, to_city }),
    });
    return response.json();
  },

  recommendTrip: async (data: TripRecommendationRequest) => {
    const response = await fetch(`${AI_API_BASE_URL}/recommend-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  translate: async (text: string, target_lang: string, source_lang = 'auto') => {
    const response = await fetch(`${AI_API_BASE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_lang, source_lang }),
    });
    return response.json();
  },

  detect: async (text: string) => {
    const response = await fetch(`${AI_API_BASE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return response.json();
  },
};
