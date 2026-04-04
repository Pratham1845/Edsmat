import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { students } from '../../data/students';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const totalStudents = students.length;
  const highRiskStudents = students.filter(s => s.riskScore === 'high').length;
  const avgAttendance = Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / totalStudents);

  const handleLogout = () => {
    console.log('Teacher logged out');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <main className="flex-1 p-8">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
            <p className="text-gray-600">Overview of your students and their progress</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Students</p>
                <p className="text-4xl font-bold">{totalStudents}</p>
              </div>
              <span className="text-5xl opacity-30">👥</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">High Risk Students</p>
                <p className="text-4xl font-bold">{highRiskStudents}</p>
              </div>
              <span className="text-5xl opacity-30">⚠️</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Avg Attendance</p>
                <p className="text-4xl font-bold">{avgAttendance}%</p>
              </div>
              <span className="text-5xl opacity-30">✅</span>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Alerts</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All →</button>
          </div>
          <div className="space-y-3">
            {students.filter(s => s.riskScore === 'high').slice(0, 3).map(student => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-600">Low attendance and declining marks</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">HIGH RISK</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Student Data</h3>
            <p className="text-sm text-gray-600 mb-4">Add or update student records and performance data</p>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Upload Data →
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Create detailed analytics and progress reports</p>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Generate Report →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
