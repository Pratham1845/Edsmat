import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StudentCard from '../../components/StudentCard';
import { students } from '../../data/students';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Demo student data (in real app, fetch from API)
  const currentStudent = {
    name: "Alex Thompson",
    grade: "10th Grade",
    riskScore: "low",
    marks: 78,
    attendance: 85,
    engagement: 72,
  };

  const recentEmotions = [
    { emotion: 'Happy', confidence: 85, time: '2 hours ago' },
    { emotion: 'Neutral', confidence: 72, time: '4 hours ago' },
    { emotion: 'Focused', confidence: 90, time: '6 hours ago' },
  ];

  const handleLogout = () => {
    console.log('Student logged out');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <main className="flex-1 p-8">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your learning overview.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span>Logout</span>
          </button>
        </div>

        {/* Risk Score Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-indigo-100 mb-2">Your Risk Score</h2>
              <div className="flex items-baseline space-x-3">
                <span className="text-5xl font-bold">LOW</span>
                <span className="text-lg text-indigo-200">Risk of Dropout</span>
              </div>
              <p className="mt-3 text-indigo-100">Great job! Keep up the excellent work.</p>
            </div>
            <div className="text-8xl opacity-20">🎯</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📊</span>
              <span className="text-2xl font-bold text-green-600">{currentStudent.marks}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Average Marks</h3>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${currentStudent.marks}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">✅</span>
              <span className="text-2xl font-bold text-blue-600">{currentStudent.attendance}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Attendance Rate</h3>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${currentStudent.attendance}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💡</span>
              <span className="text-2xl font-bold text-purple-600">{currentStudent.engagement}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Engagement Level</h3>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${currentStudent.engagement}%` }}></div>
            </div>
          </div>
        </div>

        {/* Recent Emotions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Emotion Detection</h2>
          <div className="space-y-3">
            {recentEmotions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">😊</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.emotion}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-indigo-600">{item.confidence}% confidence</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Start Emotion Detection</h3>
            <p className="text-sm text-gray-600 mb-4">Track your emotions during study sessions</p>
            <button onClick={() => navigate('/student/emotion')} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
              Launch Camera →
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chat with AI Assistant</h3>
            <p className="text-sm text-gray-600 mb-4">Get help with your questions 24/7</p>
            <button onClick={() => navigate('/student/chatbot')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Start Chat →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;




