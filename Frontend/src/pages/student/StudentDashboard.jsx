import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getStudentDashboardView, students } from '../../data/students';

const toneStyles = {
  high: {
    card: 'from-emerald-600 to-sky-600',
    score: 'text-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  medium: {
    card: 'from-amber-500 to-yellow-500',
    score: 'text-amber-100',
    badge: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  building: {
    card: 'from-orange-500 to-amber-500',
    score: 'text-orange-100',
    badge: 'bg-orange-100 text-orange-700 border-orange-200'
  }
};

const StudentDashboard = () => {
  const navigate = useNavigate();

  const currentStudent = useMemo(() => getStudentDashboardView(students[0]), []);

  const recentCheckIns = [
    { mood: 'Happy', emoji: '😊', confidence: 85, time: '2 hours ago', note: 'You looked positive during math revision.' },
    { mood: 'Neutral', emoji: '😌', confidence: 72, time: '4 hours ago', note: 'Steady focus during practice questions.' },
    { mood: 'Focused', emoji: '🎯', confidence: 90, time: '6 hours ago', note: 'Strong concentration in your study block.' }
  ];

  const recentActivity = [
    'Completed 2 assignments this week',
    'Attended all classes in the last 3 days',
    'Used AI study assistant for exam prep'
  ];

  const activeTone = toneStyles[currentStudent.health.tone] || toneStyles.medium;

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back. Here is your supportive learning snapshot.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-5 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span>Logout</span>
          </button>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-5 py-3 mb-6">
          <p className="text-sm text-cyan-900 font-medium">Your reflections are private. You control what you share, and support is available without judgment.</p>
        </div>

        <div className={`bg-linear-to-r ${activeTone.card} rounded-2xl p-8 text-white mb-8 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white/80 mb-2">Your Engagement Health</h2>
              <div className="flex items-baseline space-x-3">
                <span className="text-5xl font-bold">{currentStudent.engagementScore}%</span>
                <span className={`text-lg ${activeTone.score}`}>Engagement Score</span>
              </div>
              <p className="mt-3 text-white font-medium">{currentStudent.health.headline}</p>
              <p className="mt-1 text-white/90 text-sm">{currentStudent.health.message}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${activeTone.badge}`}>
                Learning Momentum
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500">MK</span>
              <span className="text-2xl font-bold text-green-600">{currentStudent.marks}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Average Marks</h3>
            <p className="mt-1 text-xs text-gray-500">Nice work staying on track.</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${currentStudent.marks}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500">AT</span>
              <span className="text-2xl font-bold text-blue-600">{currentStudent.attendance}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Attendance Rate</h3>
            <p className="mt-1 text-xs text-gray-500">Attendance is improving.</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${currentStudent.attendance}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500">EN</span>
              <span className="text-2xl font-bold text-violet-600">{currentStudent.engagement}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Engagement Level</h3>
            <p className="mt-1 text-xs text-gray-500">Your recent participation is consistent.</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${currentStudent.engagement}%` }} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Progress Summary</h2>
            <p className="text-sm text-gray-600 mb-4">{currentStudent.progressSummary}</p>
            <ul className="space-y-2">
              {currentStudent.nudges.map((nudge) => (
                <li key={nudge} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                  {nudge}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <span className="text-lg text-gray-500">-</span>
                  <p className="text-sm text-gray-700">{activity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Check-ins</h2>
          <div className="space-y-3">
            {recentCheckIns.map((item) => (
              <div key={`${item.mood}-${item.time}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.mood}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.note}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500">{item.confidence}% confidence</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Wellbeing Check-ins</h3>
            <p className="text-sm text-gray-600 mb-4">Optional camera-assisted check-ins to reflect on your learning mood.</p>
            <button onClick={() => navigate('/student/emotion')} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
              Open Check-ins ->
            </button>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Support Suggestion</h3>
            <p className="text-sm text-gray-600 mb-4">{currentStudent.supportSuggestion}</p>
            <button onClick={() => navigate('/student/mentors')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Check in with a mentor ->
            </button>
          </div>

          <div className="bg-linear-to-br from-indigo-50 to-sky-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Study Assistant</h3>
            <p className="text-sm text-gray-600 mb-4">Ask for quick explanations, practice plans, and study motivation.</p>
            <button onClick={() => navigate('/student/chatbot')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Start Chat ->
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;



