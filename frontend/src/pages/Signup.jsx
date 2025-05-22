import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicRequest, setAuthToken, setUserInfo, getAuthToken } from '../hooks/requestMethods';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [validFields, setValidFields] = useState({});
  
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
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  
  const validateField = (name, value) => {
    let isValid = false;
    let errorMessage = '';
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.length < 2) {
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        } else {
          isValid = true;
        }
        break;
      
      case 'username':
        if (!value.trim()) {
          errorMessage = 'Username is required';
        } else if (value.length < 3) {
          errorMessage = 'Username must be at least 3 characters';
        } else {
          isValid = true;
        }
        break;
        
      case 'email':
        if (!value) {
          errorMessage = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errorMessage = 'Email is invalid';
        } else {
          isValid = true;
        }
        break;
        
      case 'password':
        if (!value) {
          errorMessage = 'Password is required';
        } else if (value.length < 8) {
          errorMessage = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errorMessage = 'Password must contain uppercase, lowercase, and number';
        } else {
          isValid = true;
        }
        
        // Also validate confirmPassword if it has a value
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            setErrors(prev => ({
              ...prev,
              confirmPassword: 'Passwords do not match'
            }));
            setValidFields(prev => ({
              ...prev,
              confirmPassword: false
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              confirmPassword: ''
            }));
            setValidFields(prev => ({
              ...prev,
              confirmPassword: true
            }));
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errorMessage = 'Please confirm your password';
        } else if (value !== formData.password) {
          errorMessage = 'Passwords do not match';
        } else {
          isValid = true;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    setValidFields(prev => ({
      ...prev,
      [name]: isValid
    }));
    
    return isValid;
  };
  
  const validateForm = () => {
    const fields = ['firstName', 'lastName', 'email', 'username', 'password', 'confirmPassword'];
    let isValid = true;
    
    fields.forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) {
        isValid = false;
      }
    });
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setGeneralError('');
    
    try {
      // Format data according to API requirements
      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      };
      
      const request = publicRequest();
      const response = await request.post('/auth/register', requestData);
      
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
          // If we have a token but no user data, try to get user data
          // Create minimal user object from form data
          const defaultUser = {
            username: formData.username,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
          };
          setUserInfo(defaultUser);
          navigate('/dashboard');
          return;
        }
      }
      
      // If we got here, something went wrong
      setGeneralError('Registration successful but login failed. Please try logging in.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setGeneralError(errorMessage);
      
      // Check if we might have a token despite the error
      const token = getAuthToken();
      if (token) {
        // Create minimal user object from form data
        const defaultUser = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        };
        setUserInfo(defaultUser);
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get input classes based on validation state
  const getInputClasses = (fieldName) => {
    const baseClasses = "w-full px-4 py-2.5 rounded-lg bg-gray-50 border focus:outline-none focus:ring-2 transition-colors duration-200";
    const iconClasses = fieldName === 'email' || fieldName === 'password' || fieldName === 'confirmPassword' ? 'pl-11' : '';
    
    if (errors[fieldName]) {
      return `${baseClasses} ${iconClasses} border-red-500 focus:ring-red-500 focus:border-red-500`;
    } else if (validFields[fieldName]) {
      return `${baseClasses} ${iconClasses} border-green-500 focus:ring-green-500 focus:border-green-500`;
    } else {
      return `${baseClasses} ${iconClasses} border-gray-300 focus:ring-indigo-500 focus:border-indigo-500`;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join us and start your journey</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 backdrop-blur-sm bg-opacity-95 border border-gray-100">
          {generalError && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {generalError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="mb-4">
                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                    errors.firstName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : validFields.firstName 
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
              </div>
              
              {/* Last Name */}
              <div className="mb-4">
                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                    errors.lastName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : validFields.lastName 
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>
            
            {/* Username */}
            <div className="mb-4">
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pl-11 rounded-lg bg-gray-50 border ${
                    errors.username 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : validFields.username 
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
                {validFields.username && !errors.username && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
            </div>
            
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pl-11 rounded-lg bg-gray-50 border ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : validFields.email 
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
                {validFields.email && !errors.email && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses('password')}
                  required
                />
                {validFields.password && !errors.password && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            
            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses('confirmPassword')}
                  required
                />
                {validFields.confirmPassword && !errors.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
