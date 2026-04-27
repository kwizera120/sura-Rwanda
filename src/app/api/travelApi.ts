export interface Attraction {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  duration: string;
  price: string;
  activities: string[];
  location: {
    lat: number;
    lng: number;
  } | null;
}

export interface Food {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: string;
  mustTry: boolean;
  ingredients: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  specialty: string;
  price: string;
  rating: number;
}

export interface TripPlan {
  budget: number;
  duration: number;
  travelers: number;
  dailyBudget: number;
  accommodation: string[];
  activities: string[];
  food: string[];
  transport: string;
  totalEstimate: number;
  liveContext: {
    weather: {
      city: string;
      temperature: number;
      humidity: number;
      windSpeed: number;
      description: string;
      source: string;
    };
    exchangeRates: {
      usdToRwf: number;
      eurToRwf: number;
      gbpToRwf: number;
      lastUpdated: string;
      source: string;
    };
  };
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const attractionsAPI = {
  async getAll(category?: string) {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ data: Attraction[]; stats: Record<string, number>; source: string[] }>(`/places${query}`);
  },
};

export const foodAPI = {
  async getAll() {
    return request<{
      dishes: Food[];
      restaurants: Restaurant[];
      tips: {
        etiquette: string[];
        streetFood: {
          bestAreas: string[];
          popularItems: string[];
          priceRange: string[];
        };
      };
      source: string[];
    }>('/foods');
  },
};

export const tripPlannerAPI = {
  async generatePlan(payload: { budget: number; duration: number; travelers: number; interests: string[] }) {
    return request<TripPlan>('/trip-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const languageAPI = {
  async translate(text: string) {
    return request<{ match: string | null; translation: string | null; note: string; source: string }>(
      '/language/translate',
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      },
    );
  },
};

export const utilityAPI = {
  async getWeather(city = 'Kigali') {
    return request<{
      city: string;
      temperature: number;
      humidity: number;
      windSpeed: number;
      description: string;
      source: string;
    }>(`/weather?city=${encodeURIComponent(city)}`);
  },

  async getExchangeRates() {
    return request<{
      usdToRwf: number;
      eurToRwf: number;
      gbpToRwf: number;
      lastUpdated: string;
      source: string;
    }>('/exchange-rates');
  },
};
