import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const studentMenuItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { name: 'Emotion Detection', path: '/student/emotion', icon: '😊' },
    { name: 'AI Chatbot', path: '/student/chatbot', icon: '💬' },
    { name: 'Progress', path: '/student/progress', icon: '📈' },
    { name: 'Mentors', path: '/student/mentors', icon: '👨‍🏫' },
  ];

  const teacherMenuItems = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
    { name: 'Students', path: '/teacher/students', icon: '👥' },
    { name: 'Upload Data', path: '/teacher/upload', icon: '📤' },
    { name: 'Alerts', path: '/teacher/alerts', icon: '⚠️' },
  ];

  const menuItems = role === 'student' ? studentMenuItems : teacherMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {role === 'student' ? 'Student Portal' : 'Teacher Portal'}
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Help Section */}
      <div className="p-6 border-t border-gray-200">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h3>
          <p className="text-xs text-gray-600 mb-3">Contact support team</p>
          <button className="w-full px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
