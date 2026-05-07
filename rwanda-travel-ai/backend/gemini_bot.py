import os
import requests
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(ENV_PATH)

def ask_gemini(message: str, history: list[dict] | None = None, system_instruction: str = "") -> str:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        return "Gemini API Key not found. Please check your .env file."

    GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

    contents = []
    
    if system_instruction:
        contents.append({
            "role": "user",
            "parts": [{"text": f"System Instruction: {system_instruction}"}]
        })
        contents.append({
            "role": "model", 
            "parts": [{"text": "Understood. I will follow these instructions."}]
        })

    if history:
        for item in history:
            role = "user" if item["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": item["content"]}]
            })

    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.8,
            "topK": 40,
            "maxOutputTokens": 1024,
        }
    }

    try:
        response = requests.post(GEMINI_URL, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again in a moment."

def get_housing_chatbot_response(message: str, history: list[dict] | None = None, property_context: dict | None = None) -> str:
    system_instruction = (
        "You are a professional real estate assistant for Sura Rwanda's Housing platform. "
        "Your goal is to help users find apartments or buy houses in Rwanda. "
        "Be polite, professional, and knowledgeable about the Rwandan real estate market. "
    )
    
    if property_context:
        system_instruction += (
            f"\nThe user is currently looking at a property with these details:\n"
            f"- Location: {property_context.get('location')}\n"
            f"- Size: {property_context.get('size_sqm')} sqm\n"
            f"- Bedrooms: {property_context.get('bedrooms')}\n"
            f"- Predicted Price: ${property_context.get('predicted_price'):,.2f}\n"
            "Use this context if the user asks about the current property."
        )

    return ask_gemini(message, history, system_instruction)
