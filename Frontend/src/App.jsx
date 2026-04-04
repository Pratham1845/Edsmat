import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebcamEmotionProvider } from './context/WebcamEmotionContext';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import EmotionPage from './pages/student/EmotionPage';
import ChatbotPage from './pages/student/ChatbotPage';
import ProgressPage from './pages/student/ProgressPage';
import Mentors from './pages/student/Mentors';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Students from './pages/teacher/Students';
import UploadData from './pages/teacher/UploadData';
import Alerts from './pages/teacher/Alerts';

function App() {
  return (
    <WebcamEmotionProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/emotion" element={<EmotionPage />} />
          <Route path="/student/chatbot" element={<ChatbotPage />} />
          <Route path="/student/progress" element={<ProgressPage />} />
          <Route path="/student/mentors" element={<Mentors />} />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/students" element={<Students />} />
          <Route path="/teacher/upload" element={<UploadData />} />
          <Route path="/teacher/alerts" element={<Alerts />} />
        </Routes>
      </Router>
    </WebcamEmotionProvider>
  );
}

export default App;
