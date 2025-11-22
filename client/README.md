TripMind – AI-Powered Trip Planner App

A Smart Travel Planning App built using React Native (Expo), Node.js, Express, MongoDB & AI.
TripMind helps users plan trips effortlessly using AI-generated itineraries, budget estimation, hotel suggestions, place recommendations, weather insights, and interactive map/location features. The app supports authentication, trip saving, and works on both Android & iOS using Expo EAS builds.

Features
AI-Powered Travel Experience
Smart itinerary generation using AI
Personalized travel suggestions
Budget estimation based on trip type
Hotel and place recommendations

Location & Maps
Real-time location access
Location picker
Map-based trip planning
Weather integration for locations

Mobile App (React Native + Expo)
Modern, clean UI with tabs
Secure login & signup
Save & manage trip plans
Fast offline-friendly experience
EAS build support (APK, AAB, iOS IPA)

Backend API (Node.js + Express)
JWT-based authentication
MongoDB Atlas / Local MongoDB
REST API for trips, users & weather
Input validation & error handling
Secure token storage

Tech Stack
Frontend (Mobile App)
React Native (Expo)
TypeScript
Expo Router
Expo Location API
AsyncStorage
Fetch / Axios

Backend
Node.js
Express.js
MongoDB & Mongoose
JWT Authentication

Weather API
AI API (OpenAI / Gemini)

📁 Project Structure
TripMind/
│
├── client/                 # React Native (Expo) Mobile App
│   ├── app/                # Screens & navigation
│   ├── components/         # UI components
│   ├── services/           # API services (auth, planner)
│   ├── contexts/           # React context
│   ├── assets/             # Images & icons
│   ├── app.json            # Expo config
│   └── ...
│
└── server/                 # Node.js Backend API
    ├── controllers/        # Controllers
    ├── routes/             # API Routes
    ├── middleware/         # Auth & error handling
    ├── models/             # Mongoose models
    ├── utils/              # Helper utilities
    ├── config/             # Environment config
    └── server.js           # Entry point

Installation & Setup
Clone the Repository
git clone https://github.com/indrajithkss/TripMind.git
cd TripMind

Running the React Native (Expo) App
Install dependencies:
cd client
npm install

Start the Expo app:
npx expo start

Running the Backend Server
Install dependencies:
cd server
npm install

Start the server:
npm run dev


Make sure .env contains:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_api_key
WEATHER_API_KEY=your_weather_api

 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/auth/signup	Register user
POST	/api/auth/signin	Login user
Trip Planner
Method	Endpoint	Description
POST	/api/planner/create	Create a trip plan
GET	/api/planner/my-plans	Get user’s trips
GET	/api/planner/:id	Get trip details
Health Check
GET /api/health


 Builds
Android APK / AAB Build
eas build -p android --profile production

iOS IPA Build
eas build -p ios --profile production

ecurity

API keys stored in .env (never committed)

JWT secure authentication

Server protected with CORS & validation

GitHub push protection enabled



👤 Developer

Indrajith K S
Mobile App Developer | MERN | React Native
GitHub: https://github.com/indrajithkss
