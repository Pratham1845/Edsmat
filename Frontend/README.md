# EdSmart - AI-Based Student Dropout Prevention System

A comprehensive MERN stack frontend application for preventing student dropouts through AI-powered analytics, emotion detection, and personalized support.

## 🚀 Features

### For Students:
- **Dashboard**: View risk score, emotion summary, and progress overview
- **Emotion Detection**: Real-time facial emotion tracking during study sessions
- **AI Chatbot**: 24/7 intelligent assistance for academic and emotional support
- **Progress Tracking**: Monitor performance across all subjects with visual analytics
- **Mentor Matching**: Find and connect with subject-specific mentors

### For Teachers:
- **Dashboard**: Overview of total students, high-risk students, and average attendance
- **Student Management**: View and filter students by risk level
- **Data Upload**: Add or update student records and performance metrics
- **Alerts System**: Receive automated alerts for at-risk students with detailed insights

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation bar
│   ├── Sidebar.jsx         # Role-based sidebar
│   ├── MentorCard.jsx      # Mentor display card
│   ├── StudentCard.jsx     # Student display card
│   └── AlertCard.jsx       # Alert notification card
│
├── pages/
│   ├── public/
│   │   ├── Landing.jsx     # Landing page
│   │   ├── Login.jsx       # Login page
│   │   └── Signup.jsx      # Signup page
│   │
│   ├── student/
│   │   ├── StudentDashboard.jsx
│   │   ├── EmotionPage.jsx
│   │   ├── ChatbotPage.jsx
│   │   ├── ProgressPage.jsx
│   │   └── Mentors.jsx
│   │
│   └── teacher/
│       ├── TeacherDashboard.jsx
│       ├── Students.jsx
│       ├── UploadData.jsx
│       └── Alerts.jsx
│
├── data/
│   ├── mentors.js          # Dummy mentor data
│   └── students.js         # Dummy student data
│
├── App.jsx                 # Main app with routing
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Build tool and dev server

## 📦 Installation

1. Navigate to the Frontend directory:
```bash
cd Edsmat/Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5173
```

## 🎨 Design Features

- **Modern SaaS Dashboard**: Clean, professional interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Color-Coded Risk Levels**:
  - 🟢 Green: Low risk
  - 🟡 Yellow: Medium risk
  - 🔴 Red: High risk
- **Smooth Animations**: Blob animations, transitions, and hover effects
- **Card-Based Layout**: Organized information display
- **Gradient Backgrounds**: Visually appealing color schemes

## 🔐 User Roles

### Student Access:
- Email: any@student.edu
- Password: any
- Routes: `/student/*`

### Teacher Access:
- Email: any@teacher.edu
- Password: any
- Routes: `/teacher/*`

## 📝 Notes

- This is a **frontend-only** implementation with dummy data
- All forms have TODO comments where backend integration should occur
- Authentication is simulated (no real login required for demo)
- Emotion detection UI is ready for face-api.js integration
- Chatbot has simulated responses (ready for API integration)

## 🚧 Future Enhancements

- Backend API integration (Node.js + Express + MongoDB)
- Real authentication with JWT tokens
- Face-api.js integration for actual emotion detection
- AI chatbot with Gemini/Hugging Face API
- Real-time data updates with WebSockets
- Export functionality for reports
- Email notifications for alerts

## 📄 License

This project is part of the EdSmart dropout prevention system.

---

**Built with ❤️ for better student outcomes**
