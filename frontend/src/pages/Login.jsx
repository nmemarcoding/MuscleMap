import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicRequest, setAuthToken, setUserInfo, getAuthToken } from '../hooks/requestMethods';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (generalError) setGeneralError('');
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setGeneralError('');
    
    try {
      // Format data according to API requirements
      const loginData = {
        email: formData.email,
        password: formData.password
      };
      
      const request = publicRequest();
      const response = await request.post('/auth/login', loginData);
      
      // Check if we have a token either in the response data or from the interceptor
      let token = response.data.token;
      let user = response.data.user || response.data;
      
      // If we don't have a user object but have other data, use that as the user
      if (!user || typeof user !== 'object') {
        if (typeof response.data === 'object' && response.data !== null) {
          // Exclude token property if it exists
          const { token: _, ...userData } = response.data;
          user = userData;
        }
      }
      
      // Check if token exists in cookies (might have been set by interceptor)
      if (!token) {
        token = getAuthToken();
      }
      
      if (token) {
        setAuthToken(token);
        
        // Make sure we have user data before redirecting
        if (user && typeof user === 'object') {
          setUserInfo(user);
          navigate('/dashboard');
          return;
        } else {
          // If we have a token but no user data, create minimal user object
          const defaultUser = {
            email: formData.email,
            username: formData.email.split('@')[0]
          };
          setUserInfo(defaultUser);
          navigate('/dashboard');
          return;
        }
      }
      
      // If we got here, something went wrong
      setGeneralError('Login failed. Please try again.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setGeneralError(errorMessage);
      
      // Check if we might have a token despite the error
      const token = getAuthToken();
      if (token) {
        // Create minimal user object from form data
        const defaultUser = {
          email: formData.email,
          username: formData.email.split('@')[0]
        };
        setUserInfo(defaultUser);
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-primary-50 to-white p-4 pt-20">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-dark-900 mb-2">Welcome Back</h1>
          <p className="text-dark-500">Sign in to continue your fitness journey</p>
        </div>
        
        <div className="card">
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {generalError}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-dark-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-dark-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-11 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-dark-200'
                  }`}
                  required
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-dark-700">
                  Password
                </label>
                <button 
                  type="button"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-dark-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-11 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-dark-200'
                  }`}
                  required
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-700">
                Remember me
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-medium text-white ${
                isLoading 
                  ? 'bg-primary-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg'
              } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 flex justify-center items-center`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-dark-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
