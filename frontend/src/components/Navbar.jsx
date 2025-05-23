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
    <nav className="bg-white fixed w-full top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-display font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                MuscleMap
              </Link>
            </div>
            
            {/* Desktop navigation links */}
            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/dashboard' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50/50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/exercises" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/exercises' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50/50'
                    }`}
                  >
                    Exercises
                  </Link>
                  <Link 
                    to="/workouts/create" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/workouts/create' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50/50'
                    }`}
                  >
                    Create Workout
                  </Link>
                  <Link 
                    to="/exercises/create" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/exercises/create' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50/50'
                    }`}
                  >
                    Create Exercise
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/login' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50/50'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/signup' 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50/50'
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
                <div className="mr-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold uppercase">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-medium text-dark-700">
                      {user?.firstName || user?.username || user?.fullName?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-1.5 bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="sm:hidden -mr-2 flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-dark-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/dashboard'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-dark-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/exercises"
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/exercises'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-dark-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                Exercises
              </Link>
              <Link
                to="/workouts/create"
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/workouts/create'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-dark-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                Create Workout
              </Link>
              <Link
                to="/exercises/create"
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/exercises/create'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-dark-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                Create Exercise
              </Link>
              <div className="pt-4 pb-3 border-t border-dark-200">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold uppercase">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-dark-800">
                      {user?.firstName} {user?.lastName || user?.fullName}
                    </div>
                    <div className="text-sm font-medium text-dark-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
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
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/login'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-dark-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/signup'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-dark-700 hover:bg-primary-50 hover:text-primary-600'
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

