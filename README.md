# 🌍 TripMind – AI Powered Trip Planner App

An intelligent travel planning application built with **React Native (Expo), Node.js, Express, MongoDB, and AI APIs**.

TripMind helps travelers create personalized trip plans within seconds using AI-generated itineraries, weather insights, budget estimation, hotel recommendations, and location-based suggestions.

---
 DFD Diagram
<img width="1081" height="664" alt="image" src="https://github.com/user-attachments/assets/089c5689-361b-44ae-9415-2387fbd3f509" />
 Use Case Diagram
<img width="1076" height="673" alt="image" src="https://github.com/user-attachments/assets/d13f130e-06c7-484d-a035-8b569c852032" />

## 📱 App Screenshots
<img width="614" height="537" alt="image" src="https://github.com/user-attachments/assets/55abe2bb-7633-4f43-a570-9283e49c2a20" />
<img width="925" height="507" alt="image" src="https://github.com/user-attachments/assets/4d5c1551-7e6d-4aeb-bfb6-5caea2c82c89" />
<img width="398" height="808" alt="Screenshot 2026-07-07 182411" src="https://github.com/user-attachments/assets/d4228def-52a0-4c17-8403-96afe0c47edf" />
<img width="396" height="805" alt="Screenshot 2026-07-07 182420" src="https://github.com/user-attachments/assets/5d9b1783-9ae2-4ebc-9506-5e64de68fa91" />
<img width="405" height="812" alt="Screenshot 2026-07-07 182023" src="https://github.com/user-attachments/assets/fa44d64e-4a5e-44ae-ae36-fb26c63f4ea3" />
<img width="396" height="788" alt="Screenshot 2026-07-07 182057" src="https://github.com/user-attachments/assets/7604110c-48c3-42ee-b43e-c40d97ade705" />
<img width="400" height="822" alt="Screenshot 2026-07-07 182139" src="https://github.com/user-attachments/assets/3f9fdcee-4322-467f-aec5-ae371cf2aa0e" />

## ✨ Features

### 🤖 AI-Powered Travel Planning

* AI-generated personalized itineraries
* Smart destination recommendations
* Budget estimation
* Hotel suggestions
* Activity recommendations

### 📍 Location & Maps

* Real-time location access
* Interactive maps
* Location picker
* Nearby attractions
* Route planning

### 🌦 Weather Insights

* Real-time weather updates
* Forecast integration
* Weather-aware trip planning

### 🔐 Authentication & Security

* JWT Authentication
* Secure Login & Signup
* Protected API Routes
* Secure token storage

### 💾 Trip Management

* Save trip plans
* View trip history
* Manage itineraries
* Offline-friendly experience

---

---

## 🛠 Tech Stack

### Frontend

* React Native
* Expo
* TypeScript
* Expo Router
* AsyncStorage
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### APIs & Services

* OpenAI / Gemini API
* Weather API
* Expo Location API

---

## 📂 Project Structure

```bash
TripMind
│
├── client/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── contexts/
│   ├── assets/
│   └── app.json
│
└── server/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── models/
    ├── utils/
    ├── config/
    └── server.js
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/indrajithkss/TripMind.git

cd TripMind
```

### Frontend Setup

```bash
cd client

npm install

npx expo start
```

### Backend Setup

```bash
cd server

npm install

npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the server folder:

```env
MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_ai_api_key

WEATHER_API_KEY=your_weather_api_key
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint         | Description   |
| ------ | ---------------- | ------------- |
| POST   | /api/auth/signup | Register User |
| POST   | /api/auth/signin | Login User    |

### Trip Planner

| Method | Endpoint              | Description  |
| ------ | --------------------- | ------------ |
| POST   | /api/planner/create   | Create Trip  |
| GET    | /api/planner/my-plans | User Trips   |
| GET    | /api/planner/:id      | Trip Details |

### Health

| Method | Endpoint    |
| ------ | ----------- |
| GET    | /api/health |

---

## 📦 Build Commands

### Android APK / AAB

```bash
eas build -p android --profile production
```

### iOS IPA

```bash
eas build -p ios --profile production
```

---

## 🔒 Security

* Environment variables protected using `.env`
* JWT Authentication
* Input validation
* CORS protection
* Secure API access

---

## 🎯 Future Enhancements

* AI Chat Travel Assistant
* Multi-language support
* Trip sharing
* Expense tracking
* Flight booking integration
* Push notifications

---

## 👨‍💻 Developer
**Indrajith K S**
GitHub: https://github.com/indrajithkss

---
.
