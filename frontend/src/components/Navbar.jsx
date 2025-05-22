import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserInfo, removeAuthToken, removeUserInfo, getAuthToken } from '../hooks/requestMethods';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserInfo();
  
  useEffect(() => {
    // Check authentication status
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    removeAuthToken();
    removeUserInfo();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-indigo-600 font-bold text-xl">
                AuthSystem
              </Link>
            </div>
            
            {/* Desktop navigation links */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/dashboard' 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/profile' 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/login' 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/signup' 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Right side content: user info and mobile menu button */}
          <div className="flex items-center">
            {/* User info for desktop */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center">
                <span className="text-sm text-gray-700 mr-2">
                  Hello, {user?.firstName || user?.username || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="sm:hidden -mr-2 flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/dashboard'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/profile'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile
              </Link>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/login'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/signup'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
