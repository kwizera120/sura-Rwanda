import os
import re
from pathlib import Path
from typing import Iterable

from groq import Groq
from dotenv import load_dotenv

from backend.travel_context import build_travel_context

ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(ENV_PATH)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_FALLBACK_MODEL = "llama-3.1-8b-instant"

# Initialize Groq client
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Groq Client in chatbot.py: {e}")


def _normalize(text: str) -> str:
    return text.strip().lower()


def _extract_route(message: str):
    match = re.search(r"\bfrom\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)\b", message, re.IGNORECASE)
    if not match:
        return None

    from_city = match.group(1).strip().title()
    to_city = match.group(2).strip().title()
    return from_city, to_city


def _sanitize_history(history: Iterable[dict] | None) -> list[dict]:
    cleaned_history = []

    for item in history or []:
        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        cleaned_history.append({"role": role, "content": content})

    return cleaned_history[-8:]


def _local_chat_response(message: str) -> str:
    lower_message = _normalize(message)
    route = _extract_route(message)
    travel_context = build_travel_context(message)
    greeting_patterns = ["hello", "hi", "hey", "good morning", "good afternoon"]

    if any(re.search(rf"\b{re.escape(word)}\b", lower_message) for word in greeting_patterns):
        return (
            "Hello! Welcome to Rwanda Travel AI. I can help you chat naturally, estimate transport fares, "
            "suggest routes, and answer trip-planning questions across Rwanda."
        )

    if travel_context:
        return travel_context

    if route:
        from_city, to_city = route
        return (
            f"For travel from {from_city} to {to_city}, I can help with route guidance and fare planning. "
            "If you share the distance, I can use your local prediction model to estimate the fare."
        )

    if any(word in lower_message for word in ["price", "cost", "fare", "estimate"]):
        return (
            "I can help with fare estimates. Share the route, distance in kilometers, transport type, and demand level, "
            "or use the prediction form to get a price estimate from your local model."
        )

    if any(word in lower_message for word in ["route", "travel", "trip", "transport", "destination"]):
        return (
            "I can guide you with destinations, transport choices, and expected fares for trips in Rwanda. "
            "Ask about a route like 'from Kigali to Musanze' and I will combine local project context with general travel help."
        )

    return (
        "I am ready to chat naturally and help with Rwanda travel planning whenever you need route, destination, "
        "or fare information."
    )


def ask_groq(message: str, history: list[dict] | None = None) -> str:
    if not client or not GROQ_API_KEY:
        return _local_chat_response(message)

    cleaned_history = _sanitize_history(history)
    travel_context = build_travel_context(message)

    system_prompt = (
        "You are Rwanda Travel AI, a natural and professional assistant. "
        "You can chat normally about everyday topics, but when the user asks about Rwanda travel, routes, destinations, "
        "transport, or fares, you must prioritize the local project context that is supplied to you. "
        "If local travel context is available, use it as the most reliable source. "
        "If local context is not available for a Rwanda travel question, be honest and then answer with your general knowledge. "
        "Keep answers conversational, direct, and helpful."
    )

    messages = [{"role": "system", "content": system_prompt}]

    if travel_context:
        messages.append(
            {
                "role": "system",
                "content": f"Local Rwanda travel context from the user's project:\n{travel_context}",
            }
        )

    messages.extend(cleaned_history)
    messages.append({"role": "user", "content": message})

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.7,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error in ask_groq (chatbot.py): {e}")
        # Try fallback model if first one fails
        try:
            completion = client.chat.completions.create(
                model=GROQ_FALLBACK_MODEL,
                messages=messages,
                temperature=0.7,
            )
            return completion.choices[0].message.content
        except Exception:
            return _local_chat_response(message)


def get_trip_recommendations(
    from_city: str,
    to_city: str,
    interests: list[str],
    budget: float | None = None,
    duration: int | None = None,
    travelers: int | None = None,
) -> list[str]:
    """Uses GROQ to get real-world Rwanda travel recommendations based on route and interests."""
    if not client or not GROQ_API_KEY:
        return []

    interest_str = ", ".join(interests) if interests else "General Sightseeing"
    
    prompt = (
        f"Generate a personalized travel plan for a trip in Rwanda from {from_city} to {to_city}. "
        f"The traveler is interested in: {interest_str}. "
    )
    
    if budget and duration and travelers:
        daily_per_person = budget / (duration * travelers)
        prompt += f"Budget is ${budget} for {duration} days and {travelers} people (approx ${daily_per_person:.0f}/day per person). "

    prompt += (
        "Please provide a list of specific, real visiting sites, hotels, parks, or restaurants "
        "that are either at the destination or located on the route between these two places. "
        "Return the response as a simple bulleted list of 6-8 items. "
        "Each item should be a single line containing the name of the place and a very brief description of why it fits the interest. "
        "Do not include any introductory or concluding text."
    )

    messages = [
        {"role": "system", "content": "You are an expert Rwanda travel guide specializing in local routes and attractions."},
        {"role": "user", "content": prompt}
    ]

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.6,
        )
        content = completion.choices[0].message.content
        
        # Clean up bullet points (remove *, -, etc.)
        lines = [line.strip().lstrip("*-•").strip() for line in content.split("\n") if line.strip()]
        return [line for line in lines if len(line) > 5][:10]
    except Exception as e:
        print(f"Error in get_trip_recommendations: {e}")
        return []
