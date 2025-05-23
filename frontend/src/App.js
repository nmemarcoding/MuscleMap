import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { getAuthToken } from './hooks/requestMethods';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateExercise from './pages/CreateExercise';
import ExerciseBrowser from './pages/ExerciseBrowser';
import CreateWorkout from './pages/CreateWorkout';
import './App.css';

// 👇 Simple loading screen while checking login state
const Loading = () => (
  <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin mb-4"></div>
    <p className="text-gray-700">Loading...</p>
  </div>
);

// 👇 Only allow access to private pages if user is logged in
const ProtectedPage = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token); // convert token to true/false
    setCheckingAuth(false); // done checking
  }, []);

  if (checkingAuth) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/login" />;

  return children;
};

// 👇 Prevent logged-in users from accessing login or signup
const PublicPage = ({ children }) => {
  const tokenExists = !!getAuthToken();

  if (tokenExists) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        <Navbar />
        <div className="pt-16">
          <Routes>
            {/* Redirect base URL to login */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Login and Signup are only for unauthenticated users */}
            <Route
              path="/login"
              element={
                <PublicPage>
                  <Login />
                </PublicPage>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicPage>
                  <Signup />
                </PublicPage>
              }
            />

            {/* Dashboard is protected - only accessible if logged in */}
            <Route
              path="/dashboard"
              element={
                <ProtectedPage>
                  <Dashboard />
                </ProtectedPage>
              }
            />
            
            {/* Exercise related routes - protected */}
            <Route
              path="/exercises"
              element={
                <ProtectedPage>
                  <ExerciseBrowser />
                </ProtectedPage>
              }
            />
            <Route
              path="/exercises/create"
              element={
                <ProtectedPage>
                  <CreateExercise />
                </ProtectedPage>
              }
            />
            
            {/* Workout related routes - protected */}
            <Route
              path="/workouts/create"
              element={
                <ProtectedPage>
                  <CreateWorkout />
                </ProtectedPage>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
