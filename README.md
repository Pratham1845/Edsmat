# 🧠 Smart Emotional Learning Companion

An AI-powered web app that combines **real-time emotion detection (webcam)** with a **chatbot (HuggingFace + Gemini)** to provide supportive and intelligent responses.

---

## 🚀 Features

* 🎥 Real-time emotion detection using webcam (face-api.js)
* 💬 AI chatbot with emotional awareness
* 🧠 Emotion analysis via HuggingFace
* 🤖 Smart replies powered by Gemini API
* 📊 Mood tracking (timeline + stats)

---

## 📦 Project Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Pratham1845/Edsmat.git
cd Edsmat
```

---

### 2️⃣ Install dependencies (for backend)

```bash
npm install
```

---

## 🔐 Environment Variables Setup

This project uses API keys. You must create a `.env` file.

### 📄 Create `.env` file in root folder

```env
HF_TOKEN=your_huggingface_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5502
```

---

## 🔑 How to Get API Keys

### 🤗 HuggingFace Token

1. Go to: https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Select **Read access**
4. Copy and paste into `.env` as:

```
HF_TOKEN=your_token_here
```

---

### ✨ Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy and paste into `.env` as:

```
GEMINI_API_KEY=your_key_here
```

---

## ▶️ Run the Project

### Start backend server

```bash
node server.js
```

Server will run on:

```
http://localhost:5502
```

---

### Open frontend

Open in browser:

```
index.html   (webcam + emotion detection)
chatbot.html (chat interface)
```

---

## 📁 Models Setup (IMPORTANT)

Ensure `models/` folder exists with required files:

```
models/
 ├── face_expression_model-weights_manifest.json
 ├── face_expression_model-shard1
 ├── tiny_face_detector_model-weights_manifest.json
 ├── tiny_face_detector_model-shard1
 ├── face_landmark_68_tiny_model-weights_manifest.json
 ├── face_landmark_68_tiny_model-shard1
```

⚠️ Without these, webcam emotion detection will NOT work.

---

## ❗ Important Notes

* ❌ Do NOT upload `.env` file to GitHub
* ✅ `.env.example` can be shared instead
* 🔐 Always keep API keys private

---

## 🛠 Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js, Express
* AI:

  * face-api.js (webcam emotion)
  * HuggingFace (text emotion)
  * Gemini API (chat responses)

---

## 💡 Future Improvements

* 🔔 Real-time emotional alerts
* 📊 Advanced analytics dashboard
* 🧠 Personalized learning suggestions

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
