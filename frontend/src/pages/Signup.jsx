import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicRequest, setAuthToken, setUserInfo } from '../hooks/requestMethods';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    gender: '',
    birthDate: '',
    height: '',
    weight: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState({
    isMatching: false,
    isDirty: false
  });
  const [fieldTouched, setFieldTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  
  // Check password matching whenever either password or confirmPassword changes
  useEffect(() => {
    if (formData.password || formData.confirmPassword) {
      setPasswordMatch({
        isMatching: formData.password === formData.confirmPassword,
        isDirty: true
      });
    }
  }, [formData.password, formData.confirmPassword]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    if (!fieldTouched[name]) {
      setFieldTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear server error for this field if it exists
    if (serverErrors[name]) {
      setServerErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (generalError) setGeneralError('');
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    
    // Mark field as touched on blur
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate single field on blur
    validateField(name);
  };
  
  const validateField = (fieldName) => {
    let error = '';
    
    switch (fieldName) {
      case 'email':
        if (!formData.email) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          error = 'Email is invalid';
        }
        break;
        
      case 'password':
        if (!formData.password) {
          error = 'Password is required';
        } else if (formData.password.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/\d/.test(formData.password)) {
          error = 'Password must contain at least one number';
        }
        break;
        
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          error = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          error = 'Passwords do not match';
        }
        break;
        
      case 'fullName':
        if (!formData.fullName) {
          error = 'Full name is required';
        } else if (formData.fullName.length < 2) {
          error = 'Name is too short';
        }
        break;
        
      case 'height':
        if (formData.height && (isNaN(formData.height) || Number(formData.height) <= 0)) {
          error = 'Please enter a valid height';
        }
        break;
        
      case 'weight':
        if (formData.weight && (isNaN(formData.weight) || Number(formData.weight) <= 0)) {
          error = 'Please enter a valid weight';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return !error;
  };
  
  const validateForm = () => {
    // Track all field validations
    let isValid = true;
    const newErrors = {};
    
    // Validate all fields
    ['email', 'password', 'confirmPassword', 'fullName', 'height', 'weight'].forEach(field => {
      if (!validateField(field)) {
        isValid = false;
        newErrors[field] = errors[field];
      }
    });
    
    // Extra validation for password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setFieldTouched(allTouched);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setGeneralError('');
    setServerErrors({});
    
    try {
      // Format data according to API requirements
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        gender: formData.gender || undefined,
        birthDate: formData.birthDate || undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined
      };
      
      const request = publicRequest();
      const response = await request.post('/auth/register', registerData);
      
      // Check for token in header or response
      const token = response.headers['x-auth-token'] || response.data.token;
      const user = response.data;
      
      if (token) {
        setAuthToken(token);
        if (user) {
          setUserInfo(user);
          navigate('/dashboard');
        } else {
          // Create minimal user object if user data not returned
          const defaultUser = {
            email: formData.email,
            fullName: formData.fullName
          };
          setUserInfo(defaultUser);
          navigate('/dashboard');
        }
      } else {
        // Registration successful but no token
        navigate('/login');
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle field-specific validation errors from server
      if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
        // Process object with field keys
        setServerErrors(error.response.data.errors);
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Process array of error messages
        const errorMsg = error.response.data.errors[0];
        
        // Try to extract field name from error message
        const fieldMatch = errorMsg.match(/^([a-zA-Z]+):/);
        if (fieldMatch && fieldMatch[1]) {
          const fieldName = fieldMatch[1].toLowerCase();
          setServerErrors({
            [fieldName]: errorMsg.replace(fieldMatch[0], '')
          });
        } else {
          setGeneralError(errorMsg);
        }
      } else if (
        error.response?.status === 409 || 
        error.response?.data?.code === 11000 ||
        (typeof error.response?.data?.message === 'string' && error.response.data.message.includes('duplicate key')) ||
        (typeof error.response?.data === 'string' && error.response.data.includes('duplicate key'))
      ) {
        // Handle duplicate email error
        setServerErrors({
          email: 'This email is already registered. Please log in instead.'
        });
        setGeneralError('An account with this email already exists.');
      } else {
        // Default error message
        const errorMessage = error.response?.data?.message || 
                          'Registration failed. Please try again.';
        setGeneralError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to determine if a field has an error
  const hasError = (fieldName) => {
    return (fieldTouched[fieldName] && (errors[fieldName] || serverErrors[fieldName]));
  };
  
  // Helper to get the error message for a field
  const getErrorMessage = (fieldName) => {
    return serverErrors[fieldName] || errors[fieldName];
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MuscleMap</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 backdrop-blur-sm bg-opacity-95 border border-gray-100">
          {generalError && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {generalError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
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
                {hasError('email') && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pl-11 ${hasError('email') ? 'pr-10' : ''} rounded-lg bg-gray-50 border ${
                    hasError('email') 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
              </div>
              {hasError('email') && <p className="mt-1 text-sm text-red-500">{getErrorMessage('email')}</p>}
            </div>
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                {hasError('fullName') && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pl-11 ${hasError('fullName') ? 'pr-10' : ''} rounded-lg bg-gray-50 border ${
                    hasError('fullName') 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
              </div>
              {hasError('fullName') && <p className="mt-1 text-sm text-red-500">{getErrorMessage('fullName')}</p>}
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {hasError('password') && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pl-11 ${hasError('password') ? 'pr-10' : ''} rounded-lg bg-gray-50 border ${
                    hasError('password') 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
              </div>
              {hasError('password') ? (
                <p className="mt-1 text-sm text-red-500">{getErrorMessage('password')}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters and include a number</p>
              )}
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
                {passwordMatch.isDirty && (
                  <span className={`ml-2 text-xs font-medium ${passwordMatch.isMatching ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordMatch.isMatching ? '(Passwords match)' : '(Passwords do not match)'}
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {passwordMatch.isDirty && (
                    passwordMatch.isMatching ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )
                  )}
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pl-11 pr-10 rounded-lg bg-gray-50 border ${
                    hasError('confirmPassword') 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : passwordMatch.isDirty && !passwordMatch.isMatching
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : passwordMatch.isDirty && passwordMatch.isMatching
                          ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  required
                />
              </div>
              {hasError('confirmPassword') && <p className="mt-1 text-sm text-red-500">{getErrorMessage('confirmPassword')}</p>}
            </div>
            
            {/* Optional Fields Section */}
            <div className="mt-8 mb-2">
              <h3 className="text-md font-medium text-gray-700 mb-4">Optional Information</h3>
              
              {/* Gender Field */}
              <div className="mb-4">
                <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 transition-colors duration-200"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {hasError('gender') && <p className="mt-1 text-sm text-red-500">{getErrorMessage('gender')}</p>}
              </div>
              
              {/* Birth Date Field */}
              <div className="mb-4">
                <label htmlFor="birthDate" className="block mb-2 text-sm font-medium text-gray-700">
                  Birth Date
                </label>
                <input
                  id="birthDate"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 transition-colors duration-200"
                />
                {hasError('birthDate') && <p className="mt-1 text-sm text-red-500">{getErrorMessage('birthDate')}</p>}
              </div>
              
              {/* Height and Weight Fields in a row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="height" className="block mb-2 text-sm font-medium text-gray-700">
                    Height (cm)
                  </label>
                  <input
                    id="height"
                    type="number"
                    name="height"
                    placeholder="175"
                    value={formData.height}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="1"
                    className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                      hasError('height') 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  />
                  {hasError('height') && <p className="mt-1 text-sm text-red-500">{getErrorMessage('height')}</p>}
                </div>
                <div>
                  <label htmlFor="weight" className="block mb-2 text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    name="weight"
                    placeholder="70"
                    value={formData.weight}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="1"
                    className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                      hasError('weight') 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 transition-colors duration-200`}
                  />
                  {hasError('weight') && <p className="mt-1 text-sm text-red-500">{getErrorMessage('weight')}</p>}
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || (passwordMatch.isDirty && !passwordMatch.isMatching)}
              className={`w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex justify-center items-center gap-2 ${
                isLoading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : passwordMatch.isDirty && !passwordMatch.isMatching
                    ? 'opacity-70 cursor-not-allowed bg-gray-500 hover:bg-gray-600'
                    : 'cursor-pointer bg-indigo-600 hover:bg-indigo-700'
              } text-white focus:ring-indigo-500 mt-6`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
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
