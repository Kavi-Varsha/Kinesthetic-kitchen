# 🍳 Kinesthetic Kitchen  
### AI-Powered Personalized Recipe & Menu Recommendation System

---

## 📌 Overview

**Kinesthetic Kitchen** is an AI-powered web application that generates personalized recipes based on a user's dietary preferences, allergies, and available ingredients.

The system also includes a **Restaurant Menu Analysis feature**, where users upload a menu image and receive safe/unsafe dish recommendations using OCR + AI.

The goal of this project is to make cooking smarter, healthier, and more personalized using modern web technologies and AI integration.

---

## 🚀 Key Features

### 🔐 Authentication System
- User Registration & Login
- JWT-based Authorization
- Password Hashing using bcrypt
- Forgot & Reset Password
- Protected API Routes

---

### 🥗 Personalized Recipe Generation
- AI-powered recipe creation using **Gorg AI API**
- Supports:
  - Dietary restrictions (vegan, vegetarian, gluten-free, etc.)
  - Allergy filtering
  - Preferred cuisine
- Structured output (Ingredients, Steps, Cooking Time)
- "Recipe of the Day" suggestion

---

### 🥘 Kitchen Mode
- Generate recipes using only available ingredients
- Backend filters out restricted ingredients
- Smart prompt engineering ensures dietary compliance

---

### 🏬 Restaurant Mode (Menu Analysis)
- Upload restaurant menu image
- OCR extracts text from image
- AI analyzes menu items
- Recommends:
  - Safe dishes
  - Dishes to avoid
  - Possible substitutions

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt
- Gorg AI API
- OCR Integration

---

## 🏗 Backend Architecture


Frontend (React)
↓
Express API (Node.js)
↓
Authentication Middleware (JWT)
↓
Controllers
↓
MongoDB (User & Recipe Storage)
↓
Gorg AI API / OCR Service
↓
Structured JSON Response
↓
Frontend Rendering


---

## 🔄 Backend Workflow

1. User logs in → receives JWT token.
2. JWT is sent with every protected request.
3. Backend verifies token via middleware.
4. For recipe generation:
   - Collects user dietary profile
   - Builds AI prompt
   - Calls Gorg API
   - Validates response
   - Stores recipe in MongoDB
5. For menu analysis:
   - OCR extracts menu text
   - AI evaluates items against user restrictions
   - Returns safe/unsafe recommendations

---



## 🔒 Security Measures

- Password hashing using bcrypt
- JWT-based protected routes
- API keys stored in environment variables
- Input validation & sanitization
- CORS configuration


## 🧠 Future Enhancements

VR-based step-by-step cooking assistant

Refresh token authentication

Redis caching for AI responses

Role-based access (Admin / Restaurant accounts)

Performance monitoring dashboard

## 📈 Learning Outcomes

Implemented full-stack authentication flow

Integrated third-party AI APIs

Built secure REST APIs

Applied prompt engineering techniques

Worked with OCR text extraction

Designed scalable backend architecture
