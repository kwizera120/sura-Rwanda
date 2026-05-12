~cd # Rwanda Travel AI

A comprehensive travel planning platform for Rwanda featuring AI-powered chat, fare prediction, trip recommendations, and multi-language translation support.

## Features

- 🚗 **Fare Prediction**: ML-based transport cost estimation
- 🤖 **AI Chat Assistant**: Groq-powered conversational AI for travel queries
- 🗺️ **Trip Recommendations**: Personalized route and destination suggestions
- 🌍 **Multi-Language Translation**: Support for 12+ languages including French, Kinyarwanda, and more
- 📊 **Route Analytics**: Data-driven insights from Rwanda's transport network

## Quick Start

### Option 1: Using the Quick Start Script (Windows)

```bash
run_app.bat
```

This will automatically:
- Check and install language models if needed
- Start the FastAPI backend server
- Make the app available at http://localhost:8080

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Install Translation Language Models**
```bash
python install_languages.py
```

3. **Start the Server**
```bash
uvicorn backend.main:app --reload --port 8080
```

4. **Open in Browser**
Navigate to `http://localhost:8080`

> If port `8000` is already in the process of using, you can start the server on an alternate port:
> ```bash
> uvicorn backend.main:app --reload --port 8080
> ```

## Translation Feature

The app includes a powerful translation widget supporting:
- English, French, Spanish, German, Italian, Portuguese
- Arabic, Russian, Chinese, Japanese
- Kinyarwanda and Swahili (when available)

For detailed translation setup and troubleshooting, see [TRANSLATION_SETUP.md](TRANSLATION_SETUP.md)

## API Endpoints

- `POST /predict` - Predict transport fare
- `POST /chat` - AI chat assistant
- `POST /recommend-trip` - Get trip recommendations
- `POST /translate` - Translate text
- `POST /detect` - Detect language
- `GET /docs` - Interactive API documentation

## Project Structure

```text
rwanda-travel-ai/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── predictor.py         # ML fare prediction
│   ├── chatbot.py           # AI chat integration
│   ├── translator.py        # Translation service
│   ├── model_loader.py      # ML model management
│   ├── rwanda_destinations.py
│   ├── travel_context.py
│   └── ml_model.pkl         # Trained ML model
├── frontend/
│   ├── index.html           # Main UI
│   └── static/
│       ├── app.js           # Frontend logic
│       └── styles.css       # Styling
├── data/
│   └── routes.xlsx          # Rwanda transport data
├── notebooks/
│   └── train_model.ipynb    # ML model training
├── install_languages.py     # Language model installer
├── start_libretranslate.py  # Translation server (optional)
├── run_app.bat              # Quick start script
├── requirements.txt
├── TRANSLATION_SETUP.md     # Translation guide
└── README.md
```

## Configuration

Create or edit `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
LIBRETRANSLATE_URL=http://127.0.0.1:5000/translate
```

## Technologies

- **Backend**: FastAPI, Python 3.10+
- **ML**: scikit-learn, pandashttp://localhost:5173/
- **AI**: Groq API
- **Translation**: LibreTranslate, Argos Translate
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Development

To train a new ML model:

```bash
jupyter notebook notebooks/train_model.ipynb
```

## Troubleshooting

### Translation Not Working
1. Ensure language models are installed: `python install_languages.py`
2. Check backend is running: `http://localhost:8000/health`
3. See [TRANSLATION_SETUP.md](TRANSLATION_SETUP.md) for detailed troubleshooting

### Port Already in Use
```bash
# Use a different port
uvicorn backend.main:app --reload --port 8080
```

> The app defaults to `http://localhost:8000`. Use `8080` only if `8000` is occupied.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
