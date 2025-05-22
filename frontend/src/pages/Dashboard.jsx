import React from 'react';
import { getUserInfo } from '../hooks/requestMethods';

const Dashboard = () => {
  const user = getUserInfo();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Welcome, {user?.firstName || 'User'}!</h2>
          <p className="text-gray-700">You're now logged into your account.</p>
        </div>
        
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Your Information</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Name:</strong> {user.firstName} {user.lastName}</li>
                <li><strong>Email:</strong> {user.email}</li>
                <li><strong>Username:</strong> {user.username}</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Account Options</h3>
              <div className="space-y-3">
                <button 
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex justify-start items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </button>
                <button 
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex justify-start items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
