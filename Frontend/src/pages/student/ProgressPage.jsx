import Sidebar from '../../components/Sidebar';

const ProgressPage = () => {
  const subjects = [
    { name: 'Mathematics', progress: 78, grade: 'B+', trend: 'up' },
    { name: 'Physics', progress: 65, grade: 'C+', trend: 'stable' },
    { name: 'English', progress: 88, grade: 'A', trend: 'up' },
    { name: 'Chemistry', progress: 72, grade: 'B-', trend: 'down' },
    { name: 'Computer Science', progress: 92, grade: 'A', trend: 'up' },
    { name: 'Biology', progress: 81, grade: 'A-', trend: 'up' },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
          <p className="text-gray-600">Monitor your academic performance across subjects</p>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-3xl font-bold text-gray-900">79%</p>
            <p className="text-sm text-gray-600 mt-1">Overall Average</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-3xl font-bold text-gray-900">6</p>
            <p className="text-sm text-gray-600 mt-1">Subjects</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-3xl font-bold text-gray-900">B+</p>
            <p className="text-sm text-gray-600 mt-1">Overall Grade</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-2">🔥</div>
            <p className="text-3xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600 mt-1">Day Streak</p>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                <span className="text-2xl">{getTrendIcon(subject.trend)}</span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getProgressColor(subject.progress)}`}
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Current Grade</p>
                  <p className="text-xl font-bold text-indigo-600">{subject.grade}</p>
                </div>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Personalized Recommendations</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 bg-white rounded-lg p-4">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold text-gray-900">Focus on Chemistry</p>
                <p className="text-sm text-gray-600">Your Chemistry grade has declined. Consider scheduling a session with your mentor.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white rounded-lg p-4">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-gray-900">Great Job in Computer Science!</p>
                <p className="text-sm text-gray-600">You're excelling! Keep up the excellent work and consider helping peers.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
