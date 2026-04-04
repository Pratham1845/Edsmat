# Integration Setup Guide

## Project Structure
- **Frontend** (React/Vite): Main application running on port 5173 (dev) or 3000 (production)
- **Chat Backend** (Node.js/Express): AI chatbot server running on port 5502

## Running the Services

### 1. Start the Chat Backend Server
Open a terminal in `d:\hackthon\GNA hackathon\Edsmat\chat`:
```bash
npm install  # (if dependencies not installed)
npm run dev  # (development with nodemon)
# OR
npm start    # (production)
```
Expected output: `🚀 Server running on http://localhost:5502`

### 2. Start the Frontend
Open another terminal in `d:\hackthon\GNA hackathon\Edsmat\Frontend`:
```bash
npm install  # (if dependencies not installed)
npm run dev  # (starts Vite dev server on port 5173)
```

### 3. Test the Integration
1. Open http://localhost:5173 in your browser
2. Login as a student
4. Navigate to "Emotion Detection" page - click "Start Detection" to begin real-time facial emotion analysis

## Environment Variables

### Frontend (.env)
```
VITE_CHAT_API_BASE_URL=http://localhost:5502
```

### Chat Backend (.env)
```
HF_TOKEN=hf_xxxxxxxxxxxx
GEMINI_API_KEY=Gemini_token
PORT=5502
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:5501,http://localhost:5502
```

## Key Features
- **Emotion Detection**: Uses HuggingFace (roberta-base-go_emotions) to detect student emotions from text
- **AI Responses**: Uses Google Gemini API for intelligent, empathetic responses
- **Sadness Alert**: Tracks when students express sadness consistently and provides support
- **CORS Configured**: Backend accepts requests from Frontend with proper CORS headers

## Troubleshooting
- If you get a CORS error, ensure the chat server's `.env` file has the correct `ALLOWED_ORIGINS`
- If the chat doesn't respond, verify the `GEMINI_API_KEY` and `HF_TOKEN` are valid
- Check browser console for API errors (F12 in browser)
- Verify both services are running on correct ports (5502 for backend, 5173 for frontend dev)

## Face Detection Setup
The emotion detection feature requires:
1. **Camera Permission**: Browser will request camera access when starting detection
2. **Model Files**: Face detection models are loaded from `/models` folder in the public directory
3. **Face-api.js**: Installed as npm package for React integration

### Supported Emotions
- 😄 Happy
- 😢 Sad
- 😠 Angry
- 😐 Neutral
- 😲 Surprised
- 😨 Fearful
- 🤢 Disgusted
