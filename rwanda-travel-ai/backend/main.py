from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="Rwanda Travel AI")

# CORS middleware for communication with React frontend
# We allow localhost for development and the Vercel production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://brown-travel-ai.vercel.app",
        "https://brown-travel-ai.vercel.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
STATIC_DIR = FRONTEND_DIR / "static"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class PredictRequest(BaseModel):
    from_city: str | int
    to_city: str | int
    distance_km: float
    transport_type: str | int
    demand: str | int


class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None


class TripRecommendationRequest(BaseModel):
    from_city: str
    to_city: str
    distance_km: float
    transport_type: str
    demand: str
    budget_usd: float | None = None
    duration_days: int | None = None
    travelers: int | None = None
    interests: list[str] = Field(default_factory=list)

@app.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/health")
def home():
    return {"message": "Rwanda Travel AI running"}


@app.post("/predict")
def predict(data: PredictRequest):
    from backend.predictor import predict_price
    price = predict_price(
        data.from_city,
        data.to_city,
        data.distance_km,
        data.transport_type,
        data.demand,
    )

    return {"predicted_price": price}


class RouteDistanceRequest(BaseModel):
    from_city: str
    to_city: str


@app.post("/get-route-distance")
def get_route_distance(data: RouteDistanceRequest):
    """Lookup distance from routes.xlsx based on starting and destination districts."""
    from backend.predictor import _load_routes_dataframe, _normalize
    df = _load_routes_dataframe()
    if df.empty:
        return {"error": "Routes dataset not found", "success": False}
    
    # Normalize inputs
    src = _normalize(data.from_city)
    dst = _normalize(data.to_city)
    
    # Filter for exact match in both directions
    mask = (
        (df["from_city"].astype(str).str.strip().str.lower() == src) & 
        (df["to_city"].astype(str).str.strip().str.lower() == dst)
    ) | (
        (df["from_city"].astype(str).str.strip().str.lower() == dst) & 
        (df["to_city"].astype(str).str.strip().str.lower() == src)
    )
    
    match = df[mask]
    if not match.empty:
        # Take the first match distance
        distance = float(match.iloc[0]["Distance_km"])
        return {"distance_km": distance, "success": True}
    
    return {"error": "Distance not available for this route", "success": False}


@app.post("/chat")
def chat(data: ChatRequest):
    from backend.chatbot import ask_groq
    reply = ask_groq(data.message, data.history)
    return {"response": reply}


@app.post("/recommend-trip")
def recommend_trip(data: TripRecommendationRequest):
    from backend.chatbot import get_trip_recommendations
    from backend.rwanda_destinations import get_attractions, get_interest_places, get_route_stopovers
    
    # Try to get dynamic recommendations from GROQ first for real-world data
    recommendations = get_trip_recommendations(
        from_city=data.from_city,
        to_city=data.to_city,
        interests=data.interests,
        budget=data.budget_usd,
        duration=data.duration_days,
        travelers=data.travelers
    )

    # Fallback to basic logic if GROQ fails or returns nothing
    if not recommendations:
        destination_spots = get_attractions(data.to_city, limit=3)
        stopovers = get_route_stopovers(data.from_city, data.to_city, limit=3)

        recommendations.append(f"Route: {data.from_city.title()} -> {data.to_city.title()} by {data.transport_type}.")

        if stopovers:
            recommendations.append("Suggested stopovers: " + ", ".join(stopovers) + ".")
        
        if data.interests:
            matched_interest_places = get_interest_places(data.interests, limit=5)
            if matched_interest_places:
                recommendations.append("Places matching interests: " + ", ".join(matched_interest_places) + ".")

        if destination_spots:
            recommendations.append("Top places at destination: " + ", ".join(destination_spots) + ".")

        # Basic budget-based suggestions
        if data.budget_usd and data.duration_days and data.travelers:
            daily_budget_per_person = data.budget_usd / (data.duration_days * data.travelers)
            if daily_budget_per_person < 20:
                recommendations.append("Budget Tip: Consider local guesthouses and public transport.")
            elif daily_budget_per_person > 100:
                recommendations.append("Luxury Tip: High-end lodges and private car rentals recommended.")

    return {
        "recommendations": recommendations,
        "budget_usd": data.budget_usd,
        "duration_days": data.duration_days,
        "travelers": data.travelers
    }


class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str


class DetectLanguageRequest(BaseModel):
    text: str


@app.post("/translate")
def translate(data: TranslateRequest):
    """Translate text from source language to target language."""
    from backend.translator import translate_text
    try:
        translated = translate_text(data.text, data.source_lang, data.target_lang)
        return {"translatedText": translated, "success": True}
    except Exception as e:
        return {"error": str(e), "success": False}


@app.post("/detect")
def detect(data: DetectLanguageRequest):
    """Detect the language of the provided text."""
    from backend.translator import detect_language
    try:
        detected_lang = detect_language(data.text)
        return [{"language": detected_lang, "confidence": 1.0}]
    except Exception as e:
        return {"error": str(e)}
