<div align="center">

# 🧠 AI Academic Mentor
### Personalized Learning Assistant for Students

CSE 4104 — Software Development III · Spring 2026
Northern University of Business & Technology, Khulna (NUBTK)

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

</div>

---
## 📋 Team Information

| Field | Details |
|-------|---------|
| **Team Name** | CSE4104-7C-T05 |
| **Section** | 7C |
| **Project Title** | AI Academic Mentor |

### 👥 Team Members

| Role | Full Name | Student ID |
|------|------|-------------|
| Team Leader | Shadman Sadequeen Priyo | 11230121158 |
| Frontend Developer | Musabbir Hossain Chayon | 11230121168 |
| Backend Developer | Sk. Nadirul Haque Nadir | 11230121155 |
| AI Integration Lead | Shafin Kabir | 11230121175 |

---

## 🎯 Project Overview

### Problem Statement

Students face multiple challenges in their academic journey :

- 📅 **Difficulty organizing study schedules** - No structured approach to manage multiple subjects and deadlines
- 📚 **Lack of personalized learning resources** - Generic study materials don't adapt to individual learning pace
- ❓ **No intelligent system for academic queries** - Questions arise at odd hours with no one to help
- 📖 **Struggles with complex subject matter** - Traditional methods lack AI-powered simplification
- 📊 **No feedback mechanism for progress** - Students don't know their strengths and weaknesses

### 💡 Our Solution

**AI Academic Mentor** is an intelligent learning assistant that :

- Provides personalized study recommendations based on student performance
- Answers academic questions using state-of-the-art AI (Gemini/OpenAI)
- Generates custom quizzes and practice materials on any topic
- Tracks learning progress with visual analytics and dashboards
- Offers 24/7 academic support without human intervention

### 🤖 Why AI is Essential

Traditional learning systems are static and one-size-fits-all. AI makes AI Academic Mentor :

| Benefit | Description |
|---------|-------------|
| **Adaptive** | Changes difficulty based on student performance |
| **Conversational** | Natural dialogue like a real human tutor |
| **Intelligent** | Understands context and provides relevant answers |
| **Scalable** | Can help unlimited students simultaneously |
| **Personalized** | Tailors content to individual learning styles |

---

## ✨ Proposed Features

| SL No | Feature | Description |
|---|---------|-------------|
| 1 | 🔐 **User Authentication** | Secure registration and login with JWT tokens |
| 2 | 💬 **AI Chatbot** | Real-time Q&A using Gemini API / OpenAI |
| 3 | 📚 **Smart Recommendations** | AI suggests resources based on skill level |
| 4 | 📝 **Quiz Generator** | Creates custom quizzes on any subject |
| 5 | 📊 **Progress Dashboard** | Visual charts of learning analytics |
| 6 | 📅 **AI Study Planner** | Generates personalized study schedules |
| 7 | 📎 **Resource Library** | Save and organize learning materials |
| 8 | 📈 **Performance Analytics** | Track strengths and weak areas |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 19.2.7 | User Interface development |
| Vite 8.1.1 | Frontend build tool and development server |
| React Router DOM | Client-side routing |
| Axios | API calls and HTTP requests |
| CSS3 | Styling and responsive design |
| JavaScript (ES6+) | Frontend application logic |


### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime environment |
| Express.js | REST API framework |
| JSON Web Token (JWT) | Authentication and authorization |
| bcryptjs | Password hashing and security |
| CORS | Cross-Origin Resource Sharing |
| dotenv | Environment variable management |
| Helmet | HTTP security middleware |
| Morgan | HTTP request logging |
| Express Rate Limit | API rate limiting and security |


### Database
| Technology | Purpose |
|------------|---------|
| MongoDB | Primary NoSQL database |
| Mongoose | ODM for database operations |

### AI Integration
| Technology | Purpose |
|------------|---------|
| Google Gemini API | Primary AI engine for chatbot, quiz generation, study planner, notes summarization, and academic assistance |
| Hugging Face Inference API | Backup AI model for inference and content generation |

### Deployment
| Technology | Purpose |
|------------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database hosting |

---

## 🚀 Project Setup Instructions

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v18+ | JavaScript runtime |
| npm | v9+ | Package manager |
| MongoDB | v6+ | NoSQL database |
| Git | Latest | Version control |
| Visual Studio Code | Latest | Source code editor |

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/Priyo-1158/cse4104-7c-t05-ai-academic-mentor.git

# 2. Navigate to project
cd cse4104-7c-t05-ai-academic-mentor

# 3. Install Backend Dependencies
cd backend
npm install

# 4. Create .env file (copy from .env.example)
cp .env.example .env

# 5. Run Backend Server
npm run dev

# 6. Install Frontend Dependencies (new terminal)
cd ../frontend
npm install

# 7. Run Frontend App
npm start
```
## 📁 Project Structure
```
cse4104-7c-t05-ai-academic-mentor/
│
├── backend/          # Node.js API (Week 6)
│
├── diagrams/         # System diagrams (Week 4)
│
├── documentation/    # All project documents (PDFs)
│
├── frontend/         # React app (Week 7)
│
├── screenshots/      # frontend images (Week 7)
│
├── .gitignore
│
├── LICENSE
│
└── README.md         # This file

```

## 📊 Week 7 Progress: Frontend Development (Completed)

### ✅ Deliverables Completed

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Frontend Project Setup (React.js + Tailwind CSS) | ✅ Done |
| 2 | Landing/Home Page | ✅ Done |
| 3 | Login Page | ✅ Done |
| 4 | Registration Page | ✅ Done |
| 5 | Dashboard | ✅ Done |
| 6 | User Profile Page | ✅ Done |
| 7 | AI Chatbot Page | ✅ Done |
| 8 | Quiz Generator Page | ✅ Done |
| 9 | Note Summarizer Page | ✅ Done |
| 10 | Study Planner Page | ✅ Done |
| 11 | Backend API Integration (Axios) | ✅ Done |
| 12 | Authentication Flow (JWT) | ✅ Done |
| 13 | Protected Routes | ✅ Done |
| 14 | Form Validation | ✅ Done |
| 15 | Responsive Design | ✅ Done |

### 📁 Files Location

| File | Location |
|------|----------|
| Frontend Source Code | [`frontend/`](./frontend) |
| Frontend Progress Report | [`documentation/CSE4104-7C-T05_FrontendProgress.pdf`](./documentation/CSE4104-7C-T05_FrontendProgress.pdf) |

### 🌐 Live Demo

| Platform | Link |
|----------|------|
| **Vercel Deployment** | [https://ai-academic-mentor.vercel.app](https://ai-academic-mentor.vercel.app) |


### Next Steps

- **Week 8:** AI Integration
- **Week 9:** Feature Completion
- **Week 10:** Testing and Debugging

---

## 👨‍🏫 Instructor

**Md. Riaz Mahmud**  
*Assistant Professor*  
Department of Computer Science and Engineering  
Northern University of Business and Technology, Khulna

---

**Last Updated:** 06 July , 2026
