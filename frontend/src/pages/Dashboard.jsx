import React from 'react';
import { getUserInfo } from '../hooks/requestMethods';

const Dashboard = () => {
  const user = getUserInfo();
  
  // Calculate BMI if height and weight are available
  const calculateBMI = () => {
    if (!user?.height || !user?.weight) return null;
    
    // Convert height from cm to meters
    const heightInMeters = user.height / 100;
    const bmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    
    return { bmi, category };
  };
  
  const bmiData = calculateBMI();
  
  // Get age from birthDate if available
  const getAge = () => {
    if (!user?.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(user.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const age = getAge();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MuscleMap</h1>
          <p className="text-gray-600">Your Workout Dashboard</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 backdrop-blur-sm bg-opacity-95 border border-gray-100">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white shadow-md">
            <h2 className="text-2xl font-bold mb-3">Welcome, {user?.fullName?.split(' ')[0] || user?.firstName || 'Fitness Enthusiast'}!</h2>
            <p className="opacity-90">Track your fitness journey and reach your health goals with MuscleMap.</p>
            <div className="mt-4 inline-flex items-center text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Profile Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm md:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email?.split('@')[0])}</h3>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-3">Personal Details</h4>
                  
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-gray-700 font-medium">{user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email?.split('@')[0])}</p>
                      </div>
                    </li>
                    
                    <li className="flex items-center">
                      <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-gray-700 font-medium">{user.email}</p>
                      </div>
                    </li>
                    
                    {user.gender && (
                      <li className="flex items-center">
                        <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="text-gray-700 font-medium">{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</p>
                        </div>
                      </li>
                    )}
                    
                    {user.birthDate && (
                      <li className="flex items-center">
                        <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Birth Date{age && ` (${age} years)`}</p>
                          <p className="text-gray-700 font-medium">{new Date(user.birthDate).toLocaleDateString()}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Body Metrics & Fitness Data */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm md:col-span-2">
                <h3 className="text-lg font-medium mb-5 text-gray-800">Body Metrics</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {user.height && (
                    <div className="bg-indigo-50 rounded-lg p-4 flex items-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-gray-800">{user.height}</span>
                          <span className="ml-1 text-gray-600">cm</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user.weight && (
                    <div className="bg-indigo-50 rounded-lg p-4 flex items-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Weight</p>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-gray-800">{user.weight}</span>
                          <span className="ml-1 text-gray-600">kg</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* BMI Section - Only show if both height and weight are available */}
                {bmiData && (
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <h4 className="text-md font-medium mb-4 text-gray-700">Body Mass Index (BMI)</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600">Your BMI</span>
                        <span className="text-lg font-bold text-gray-800">{bmiData.bmi}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            bmiData.category === 'Underweight' ? 'bg-blue-500' :
                            bmiData.category === 'Normal' ? 'bg-green-500' :
                            bmiData.category === 'Overweight' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${Math.min(bmiData.bmi * 3, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 px-1 mb-3">
                        <span>Underweight</span>
                        <span>Normal</span>
                        <span>Overweight</span>
                        <span>Obese</span>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-indigo-50">
                        <p className="text-sm text-gray-700">
                          Your BMI indicates you are <span className={`font-medium ${
                            bmiData.category === 'Normal' ? 'text-green-600' : 
                            bmiData.category === 'Underweight' ? 'text-blue-600' :
                            bmiData.category === 'Overweight' ? 'text-yellow-600' : 'text-red-600'
                          }`}>{bmiData.category.toLowerCase()}</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Account Options */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Account Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex justify-center items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Profile
                    </button>
                    <button 
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex justify-center items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Start Workout Section */}
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl overflow-hidden shadow-md">
            <div className="p-6 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-white text-xl font-bold mb-2">Ready to start your fitness journey?</h3>
                <p className="text-white text-opacity-90">Begin tracking your workouts and see your progress over time.</p>
              </div>
              <button className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-6 rounded-lg shadow transition-colors duration-300">
                Start Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
