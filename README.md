# SoloQuest
An all-in-one travel companion app for solo travellers — combining real-time safety alerts, itinerary planning, social features, and blogging.

## 🌍 Live Demo
Try it here 👉 https://solo-quest.vercel.app/

## 📑 Table of Contents
- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [API Overview](#-api-overview)
- [Screenshots](#-screenshots)
- [Future Work](#-future-enhancements)
- [License](#-license)

## 🧭 About the Project
SoloQuest is a full-stack travel web app designed to support and empower solo travellers. It combines practical travel tools with social connection features — all in one platform. Built as a final-year university project.

## ✨ Features
- 🔐 JWT-based user authentication
- 🧭 Safety alerts with fallback data
- 📅 Itinerary planner
- ✍️ Travel blogs with categories and comments
- 🌍 Connect with fellow solo travellers via friend requests
- 💬 Responsive UI with mobile support

## 🛠 Tech Stack
**Frontend:** Vue.js, Bootstrap, Vuex  
**Backend:** Django, Django REST Framework, SQLite  
**Authentication:** JWT  
**External APIs:** Travel Advisory API, Safety Alerts API  

## 🚀 Installation

### Frontend (Vue.js)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Django)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 🔗 API Overview

- `POST /api/token/` – Login (returns JWT)
- `GET /api/posts/` – View blog posts
- `GET /api/safety/?country=UG` – Get safety data
- `POST /api/send-request/` – Send a friend request  


## 🔮 Future Enhancements
- AI-powered itinerary recommendations
- Real-time chat between travellers
- Multi-language support
- Offline mode for safety data

## 📄 License
This project is for academic use only and not intended for commercial distribution.
