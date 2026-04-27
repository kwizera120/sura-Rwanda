# Fix Trip Planner AI Backends & Login

## [x] 1. Analysis Complete
- Analyzed folder structure & key files (main.py, model_loader.py, predictor.py, chatbot.py, translator.py, auth app.py)
- Identified root causes: Services not running, missing LibreTranslate, potential MongoDB/.env issues

## [ ] 2. Setup Configuration Files
- [ ] Create rwanda-travel-ai/.env with optional API keys
- [ ] Verify requirements.txt & install deps

## [ ] 3. Start Dependencies
- [ ] Start MongoDB (mongod)
- [ ] Setup & start LibreTranslate (rwanda-travel-ai/start_libretranslate.py)
- [ ] Verify data/routes.xlsx exists

## [ ] 4. Start Backend Services
- [ ] Auth backend: cd authentication-backend && python app.py (port 5000)
- [ ] AI backend: cd rwanda-travel-ai && uvicorn backend.main:app --reload --port 8000

## [ ] 5. Test Endpoints
- [ ] Run scripts/test_ai_endpoints.py
- [ ] Manual test: curl http://localhost:8000/health, /predict, /chat, /translate
- [ ] Test auth: http://localhost:5000/login

## [ ] 6. Frontend Integration
- [ ] npm run dev
- [ ] Test TripPlanner: login, AI features (chatbot, recommendations, model, translator)

## [ ] 7. Verify & Cleanup
- [ ] Check browser console/network for errors
- [ ] Update TODO with results
