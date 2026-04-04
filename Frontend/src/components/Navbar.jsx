import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    // TODO: Clear authentication tokens/session here
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    console.log('User logged out');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EdSmart</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {!role ? (
              // Public navigation
              <>
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/login'
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              // Authenticated navigation
              <>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 hidden lg:block">
                    Welcome, <span className="font-semibold text-gray-900">{role === 'student' ? 'Student' : 'Teacher'}</span>
                  </span>
                  <Link
                    to={role === 'student' ? '/student/dashboard' : '/teacher/dashboard'}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Dashboard
                  </Link>
                  
                  {/* Logout Button with Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span>Logout</span>
                    </button>

                    {/* Confirmation Dropdown */}
                    {showLogoutConfirm && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 animate-fade-in">
                        <div className="text-center">
                          <div className="text-4xl mb-2">👋</div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">Ready to leave?</p>
                          <p className="text-xs text-gray-600 mb-3">You'll need to login again to access your account</p>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowLogoutConfirm(false)}
                              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleLogout}
                              className="flex-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Yes, Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



