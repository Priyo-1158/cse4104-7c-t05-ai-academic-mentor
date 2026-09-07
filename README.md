> **Course:** CSE 4104 | **Semester:** Spring 2026 | Northern University of Business & Technology, Khulna
<p align="center" style="margin-bottom:-15px;">
  <img src="assets/logo.png"
       alt="AI Academic Mentor Logo" width="400" />
</p>

<div align="center">

# 🧠 **AI Academic Mentor**
### Personalized Learning Assistant for Students

---

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white" alt="Node.js" height="40"/>
  <img src="https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white" alt="Express" height="40"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" height="40"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" height="40"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" height="40"/>
  <img src="https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens" alt="JWT" height="40"/>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" height="40"/>
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" height="40"/>
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=white" alt="Render" height="40"/>
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?logo=google&logoColor=white" alt="Gemini" height="40"/>
  <img src="https://img.shields.io/badge/AI-HuggingFace-FFCC00?logo=huggingface&logoColor=black" alt="Hugging Face" height="40"/>
</p>


</div>

---
## 👥 Team Information

|Field | Details |
|---|---|
| **Team** | CSE4104-7C-T05 |
| **Section** | 7C |
| **Instructor** | Md. Riaz Mahmud, Assistant Professor, Dept. of CSE, NUBTK |

### 👨‍💻 Team Members

| 🏅 Role | 👤 Name | 🎓 Student ID |
|---|---|---|
| ⭐ Team Leader | Shadman Sadequeen Priyo | 11230121158 |
| 🎨 Frontend Developer | Musabbir Hossain Chayon | 11230121168 |
| ⚙️ Backend Developer | Sk. Nadirul Haque Nadir | 11230121155 |
| 🤖 AI Integration Lead | Shafin Kabir | 11230121175 |

---

## 🎯 Problem Statement

Students struggle with:
- 📅 Unstructured study schedules  
- 📚 Generic materials not adapting to pace  
- ❓ No instant academic Q&A  
- 📊 Lack of feedback on strengths/weaknesses  



## 💡 Our Solution

**AI Academic Mentor** →  
A full‑stack assistant with:  
- 💬 AI Chatbot  
- 📝 Quiz Generator  
- 📅 Study Planner  
- 📄 Note Summarizer  
- 📊 Progress Dashboard  

---
## ✨ Features

| # | Feature | Description |
|---|---|---|
| 🔐 | User Authentication | Secure JWT login/logout |
| 💬 | AI Chatbot | Real-time Q&A via Gemini |
| 📝 | Quiz Generator | MCQ quizzes + score history |
| 📅 | Study Planner | Day-by-day schedules |
| 📄 | Note Summarizer | Multiple summary styles |
| 🗒️ | Personal Notes | Store notes separately |
| 📊 | Progress Dashboard | Aggregated stats |
| 🛡️ | Admin Dashboard | Real user activity |


---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ⚛️ React.js 19.2.7 | User Interface development |
| ⚡ Vite 8.1.1 | Frontend build tool and development server |
| 🛣️ React Router DOM | Client-side routing |
| 🌐 Axios | API calls and HTTP requests |
| 🎨 CSS3 | Styling and responsive design |
| 📜 JavaScript (ES6+) | Frontend application logic |


### Backend
| Technology | Purpose |
|------------|---------|
| 🟢 Node.js | JavaScript runtime environment |
| 🚏 Express.js | REST API framework |
| 🔑 JSON Web Token (JWT) | Authentication and authorization |
| 🔒 bcryptjs | Password hashing and security |
| 🌍 CORS | Cross-Origin Resource Sharing |
| ⚙️ dotenv | Environment variable management |
| 🛡️ Helmet | HTTP security middleware |
| 📑 Morgan | HTTP request logging |
| ⏱️ Express Rate Limit | API rate limiting and security |


### Database
| Technology | Purpose |
|------------|---------|
| 🍃 MongoDB | Primary NoSQL database |
| 🔗 Mongoose | ODM for database operations |

### AI Integration
| Technology | Purpose |
|------------|---------|
| 🌐 Google Gemini API | Primary AI engine for chatbot, quiz generation, study planner, notes summarization, and academic assistance |
| 🤗 Hugging Face Inference API | Backup AI model for inference and content generation |

### Deployment
| Technology | Purpose |
|------------|---------|
| ▲ Vercel | Frontend hosting |
| 🟩 Render | Backend hosting |
| ☁️ MongoDB Atlas | Cloud database hosting |

---

## 🚀 Project Setup Instructions

### 📋 Prerequisites

| Tool |  Version |  Purpose |
|------|---------|---------|
| 🟢 Node.js | v18+ | JavaScript runtime |
| 📦 npm | v9+ | Package manager |
| 🍃 MongoDB | v6+ | NoSQL database |
| 🔧 Git | Latest | Version control |
| 💻 Visual Studio Code | Latest | Source code editor |

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
npm start

# 6. Install Frontend Dependencies (new terminal)
cd ../frontend
npm install

# 7. Run Frontend App
npm run dev 
```
## 📁 Project Structure
```
cse4104-7c-t05-ai-academic-mentor/
│
├── backend/          # Node.js API (Week 6)
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/         # React app (Week 7)
│   ├── public/
│   ├── src/
│   └── package.json
│
├── test/             # Test Cases (Week 10) ← NEW
│   ├── test-cases.md
│   └── bug-report.md
│
├── diagrams/         # System diagrams (Week 4)
│
├── documentation/    # All project documents (PDFs)
│
├── screenshots/      # Frontend images (Week 7)
│
├── assets/           # Logo design
│
├── .gitignore
│
├── LICENSE
│
└── README.md         # This file

```

### 📊 Week 10 Progress: Testing & Debugging (✅ Completed)

### ✅ Deliverables Completed

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Functional Testing | ✅ Done |
| 2 | Authentication & Authorization Testing | ✅ Done |
| 3 | API Testing (Postman) | ✅ Done |
| 4 | Database Testing | ✅ Done |
| 5 | AI Feature Testing | ✅ Done |
| 6 | UI/UX Testing | ✅ Done |
| 7 | Responsive Testing | ✅ Done |
| 8 | Security Testing | ✅ Done |
| 9 | Bug Tracking & Fixing | ✅ Done |
| 10 | Regression Testing | ✅ Done |

### 📝 Sample Test Cases

| TC ID | Feature | Scenario | Expected Result | Actual Result | Status |
|-------|---------|----------|-----------------|---------------|--------|
| TC-01 | User Login | Valid credentials | Redirect to dashboard | Redirect to dashboard | ✅ Passed |
| TC-02 | User Login | Invalid password | Show error message | Show error message | ✅ Passed |
| TC-03 | User Registration | Valid data | Create account | Create account | ✅ Passed |
| TC-04 | User Registration | Duplicate email | Show error message | Show error message | ✅ Passed |
| TC-05 | AI Chatbot | Valid question | AI response | AI response | ✅ Passed |
| TC-06 | AI Chatbot | Empty input | Show validation error | Show validation error | ✅ Passed |
| TC-07 | Quiz Generator | Valid topic | Generate quiz | Generate quiz | ✅ Passed |
| TC-08 | Note Summarizer | Valid notes | Generate summary | Generate summary | ✅ Passed |
| TC-09 | Protected Route | No token | Redirect to login | Redirect to login | ✅ Passed |
| TC-10 | Mobile View | All pages | Responsive layout | Responsive layout | ✅ Passed |

### 🐞 Sample Bug Report

| Bug ID | Description | Module | Severity | Status | Resolution |
|--------|-------------|--------|----------|--------|------------|
| BUG-01 | Login button disabled on empty fields | Authentication | Medium | ✅ Fixed | Added validation |
| BUG-02 | AI response timeout for long questions | AI | Medium | ✅ Fixed | Added timeout handling |
| BUG-03 | Mobile navigation overlaps | Frontend | Low | ✅ Fixed | Fixed CSS positioning |
| BUG-04 | Quiz score not saving correctly | Database | High | ✅ Fixed | Fixed Mongoose schema |


### 📁 Files Location

| File | Location |
|------|----------|
| Frontend Source Code | [`frontend/`](./frontend) |
| Frontend Progress Report | [`documentation/CSE4104-7C-T05_FrontendProgress.pdf`](./documentation/CSE4104-7C-T05_FrontendProgress.pdf) |

### 🌐 Live Demo

| Platform | Link |
|----------|------|
| **Vercel Deployment** | [https://ai-academic-mentor.vercel.app](https://ai-academic-mentor.vercel.app) |

---

## 📌 Next Steps  
 
| Week | Task |
|------|------|
| 🚀 **Week 11** | Deployment & Security |
| 📄 **Week 12** | Final Report & User Manual |
| 🎤 **Week 13** | Presentation Preparation |
| 🏁 **Week 14** | Final Presentation & Viva |


---

## 👨‍🏫 Instructor

**Md. Riaz Mahmud**  
*Assistant Professor*  
Department of Computer Science and Engineering  
Northern University of Business and Technology, Khulna

---

## 📄 License  

📜 **MIT License** ( Declared in `backend/package.json`)  
🕒 **Last Updated:** September 7, 2026  

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

