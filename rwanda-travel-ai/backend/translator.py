import os
from pathlib import Path

import requests
from dotenv import load_dotenv

ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(ENV_PATH)

LIBRETRANSLATE_URL = os.getenv("LIBRETRANSLATE_URL", "").strip()
LIBRETRANSLATE_API_KEY = os.getenv("LIBRETRANSLATE_API_KEY", "").strip()
LIBRE_DETECT_URL = os.getenv("LIBRETRANSLATE_DETECT_URL", "").strip()
MYMEMORY_URL = "https://api.mymemory.translated.net/get"

DEFAULT_LIBRE_URLS = [
    LIBRETRANSLATE_URL,
]
if LIBRETRANSLATE_API_KEY:
    DEFAULT_LIBRE_URLS.extend([
        "https://libretranslate.com/translate",
        "https://translate.argosopentech.com/translate",
    ])

# Swahili and Kinyarwanda keyword hints for fast detection
SWAHILI_HINTS = {"safari", "njema", "habari", "asante", "rafiki", "karibu", "nzuri", "sawa", "pole", "mambo"}
KW_HINTS = {"amakuru", "muraho", "urakoze", "ndetse", "muri", "ikaze"}

SUPPORTED_LANG_CODES = {
    "en", "fr", "rw", "sw", "es", "de", "it", "pt", "ar", "ru", "zh", "ja",
}


def _normalize_lang(code: str) -> str:
    return (code or "").strip().lower()


def _detect_by_hint(text: str) -> str | None:
    normalized = text.lower()
    if any(word in normalized for word in SWAHILI_HINTS):
        return "sw"
    if any(word in normalized for word in KW_HINTS):
        return "rw"
    return None


def _detect_with_langdetect(text: str) -> str | None:
    try:
        from langdetect import detect as langdetect_detect
        guessed = langdetect_detect(text)
        if guessed and guessed in SUPPORTED_LANG_CODES:
            return guessed
    except Exception:
        pass
    return None


def _get_detect_url() -> str | None:
    if LIBRE_DETECT_URL:
        return LIBRE_DETECT_URL
    if LIBRETRANSLATE_URL:
        if LIBRETRANSLATE_URL.rstrip("/").endswith("/translate"):
            return LIBRETRANSLATE_URL.rstrip("/")[:-len("/translate")] + "/detect"
        return LIBRETRANSLATE_URL.rstrip("/") + "/detect"
    if LIBRETRANSLATE_API_KEY:
        return "https://libretranslate.com/detect"
    return None


def _try_libretranslate(text: str, source_lang: str, target_lang: str) -> str | None:
    source = "auto" if _normalize_lang(source_lang) == "auto" else _normalize_lang(source_lang)
    target = _normalize_lang(target_lang)
    for url in [u for u in DEFAULT_LIBRE_URLS if u]:
        try:
            payload = {
                "q": text,
                "source": source,
                "target": target,
                "format": "text",
            }
            if LIBRETRANSLATE_API_KEY:
                payload["api_key"] = LIBRETRANSLATE_API_KEY

            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                translated = response.json().get("translatedText", "").strip()
                if translated:
                    return translated
        except Exception:
            continue
    return None


def _try_mymemory(text: str, source_lang: str, target_lang: str) -> str | None:
    # Use detect_language if source is auto
    source = detect_language(text) if _normalize_lang(source_lang) == "auto" else _normalize_lang(source_lang)
    target = _normalize_lang(target_lang)
    if not source or not target:
        return None

    langpair = f"{source}|{target}"
    try:
        response = requests.get(
            MYMEMORY_URL,
            params={"q": text, "langpair": langpair},
            timeout=8,
        )
        if response.status_code == 200:
            payload = response.json()
            translated = payload.get("responseData", {}).get("translatedText", "").strip()
            if translated:
                return translated
    except Exception:
        return None
    return None


def _detect_with_hosted_service(text: str) -> str | None:
    detect_url = _get_detect_url()
    if not detect_url:
        return None

    payload = {"q": text}
    if LIBRETRANSLATE_API_KEY:
        payload["api_key"] = LIBRETRANSLATE_API_KEY

    try:
        response = requests.post(detect_url, json=payload, timeout=5)
        if response.status_code != 200:
            return None
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("language", None)
    except Exception:
        return None
    return None


def detect_language(text: str) -> str:
    """Detect language using hosted services with fallback to langdetect and keyword hints."""
    if not text or not text.strip():
        return "en"

    hint_language = _detect_by_hint(text)
    if hint_language:
        return hint_language

    detected = _detect_with_hosted_service(text)
    if detected and detected != "en":
        return detected

    guessed = _detect_with_langdetect(text)
    if guessed and guessed != "en":
        return guessed

    return detected or "en"


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    source = "auto" if _normalize_lang(source_lang) == "auto" else _normalize_lang(source_lang)
    target = _normalize_lang(target_lang)

    if target not in SUPPORTED_LANG_CODES:
        raise RuntimeError(f"Unsupported target language: {target}")

    if source == "auto":
        source = detect_language(text)

    # We removed local Argos Translate to save memory on free tier
    online_translation = _try_libretranslate(text, source, target)
    if online_translation:
        return online_translation

    free_fallback_translation = _try_mymemory(text, source, target)
    if free_fallback_translation:
        return free_fallback_translation

    raise RuntimeError(
        "Translation failed. No reachable translation services found."
    )
