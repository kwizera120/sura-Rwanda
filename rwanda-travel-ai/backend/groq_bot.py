import os
from groq import Groq
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(ENV_PATH)

# Initialize the Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Groq Client: {e}")

def ask_groq(message: str, history: list[dict] | None = None, system_instruction: str = "") -> str:
    """
    Sends a message to Groq AI using the official SDK.
    Replaces old Gemini implementation.
    """
    if not GROQ_API_KEY:
        return "Groq API Key not found. Please check your .env file."

    if not client:
        return "Groq Client not initialized. Please check your API key."

    try:
        # Build messages list
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        
        if history:
            for item in history:
                role = "assistant" if item.get("role") in ["model", "assistant"] else "user"
                messages.append({"role": role, "content": item.get("content", "")})

        # Add current message
        messages.append({"role": "user", "content": message})

        # Call Groq API
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
            top_p=1,
            stream=False,
            stop=None,
        )
        
        return completion.choices[0].message.content

    except Exception as e:
        error_msg = str(e)
        print(f"Groq SDK Error: {error_msg}")
        return f"I'm sorry, I'm having trouble connecting to my AI brain (Error: {error_msg}). Please try again later."

def get_housing_chatbot_response(message: str, history: list[dict] | None = None, property_context: dict | None = None) -> str:
    """
    Specific wrapper for the housing chatbot context using Groq.
    """
    system_instruction = (
        "You are a professional real estate assistant for Sura Rwanda's Housing platform. "
        "Your goal is to help users find apartments or buy houses in Rwanda. "
        "Be polite, professional, and knowledgeable about the Rwandan real estate market. "
        "\n\nRESPONSE STYLE & FORMATTING:\n"
        "- Use professional, friendly language with relevant emojis (e.g., 🏠, 📍, 💰, ✨).\n"
        "- ALWAYS use Markdown for structure.\n"
        "- Use ### Headers for sections.\n"
        "- Use **bold** for prices, locations, and important features.\n"
        "- Use tables to compare properties or list technical specifications if relevant.\n"
        "- Use bullet points for clear, scannable lists of features.\n"
        "- Keep paragraphs concise and well-spaced.\n"
        "- If recommending a specific property, ALWAYS include a JSON block at the VERY END using the tag [PROPERTY_DATA]...[/PROPERTY_DATA].\n"
        "Example property data format:\n"
        "[PROPERTY_DATA]\n"
        "{\n"
        "  \"title\": \"Modern Apartment in Kacyiru\",\n"
        "  \"location\": \"Kacyiru, Kigali\",\n"
        "  \"price\": \"$1,200/month\",\n"
        "  \"bedrooms\": 3,\n"
        "  \"bathrooms\": 2,\n"
        "  \"image_url\": \"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80\"\n"
        "}\n"
        "[/PROPERTY_DATA]"
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

    return ask_groq(message, history, system_instruction)
