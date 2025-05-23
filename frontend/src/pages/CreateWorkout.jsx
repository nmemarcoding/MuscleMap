import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicRequest, getAuthToken } from '../hooks/requestMethods';

const CreateWorkout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [existingWorkouts, setExistingWorkouts] = useState([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
  const [workoutError, setWorkoutError] = useState('');
  const [formData, setFormData] = useState({
    planName: '',
    goal: '',
    level: 'beginner',
    durationWeeks: 4,
    workoutsPerWeek: 3,
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // New state for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editFormData, setEditFormData] = useState({
    planName: '',
    goal: '',
    level: 'beginner',
    durationWeeks: 4,
    workoutsPerWeek: 3,
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Options for workout levels
  const levelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Options for fitness goals
  const goalOptions = [
    { value: '', label: 'Select a goal' },
    { value: 'strength', label: 'Strength' },
    { value: 'hypertrophy', label: 'Muscle Growth' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'weight loss', label: 'Weight Loss' },
    { value: 'general fitness', label: 'General Fitness' }
  ];

  // Generate options for weeks 1-52
  const weekOptions = Array.from({ length: 52 }, (_, i) => i + 1);
  
  // Generate options for workouts per week 1-7
  const daysPerWeekOptions = Array.from({ length: 7 }, (_, i) => i + 1);

  // Fetch existing workouts on component mount
  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoadingWorkouts(true);
      try {
        const token = getAuthToken();
        const request = publicRequest();
        
        if (token) {
          request.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await request.get('/workouts');
        setExistingWorkouts(response.data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setWorkoutError('Failed to load existing workouts');
      } finally {
        setIsLoadingWorkouts(false);
      }
    };

    fetchWorkouts();
  }, []);

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
    let isValid = true;
    
    if (!formData.planName.trim()) {
      newErrors.planName = 'Workout name is required';
      isValid = false;
    }
    
    if (!formData.level) {
      newErrors.level = 'Please select a difficulty level';
      isValid = false;
    }
    
    if (formData.durationWeeks < 1 || formData.durationWeeks > 52) {
      newErrors.durationWeeks = 'Duration must be between 1 and 52 weeks';
      isValid = false;
    }
    
    if (formData.workoutsPerWeek < 1 || formData.workoutsPerWeek > 7) {
      newErrors.workoutsPerWeek = 'Workouts per week must be between 1 and 7';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setGeneralError('');
    setSuccess(false);
    
    try {
      // Convert string numbers to actual numbers
      const workoutData = {
        ...formData,
        durationWeeks: Number(formData.durationWeeks),
        workoutsPerWeek: Number(formData.workoutsPerWeek)
      };
      
      const token = getAuthToken();
      const request = publicRequest();
      
      // Add auth token to request header
      if (token) {
        request.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request.post('/workouts', workoutData);
      
      // Add the new workout to the list
      setExistingWorkouts(prev => [response.data, ...prev]);
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        planName: '',
        goal: '',
        level: 'beginner',
        durationWeeks: 4,
        workoutsPerWeek: 3,
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating workout:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create workout. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get label for level
  const getLevelLabel = (value) => {
    const option = levelOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Get label for goal
  const getGoalLabel = (value) => {
    const option = goalOptions.find(opt => opt.value === value);
    return option ? option.label : value || 'Not specified';
  };
  
  // Get color for level badge
  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800';
      case 'advanced':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add function to handle workout deletion
  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout plan?')) {
      return;
    }
    
    try {
      const token = getAuthToken();
      const request = publicRequest();
      
      if (token) {
        request.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      await request.delete(`/workouts/${workoutId}`);
      
      // Remove the deleted workout from state
      setExistingWorkouts(prev => prev.filter(workout => workout._id !== workoutId));
      
      // Show success message (could add specific deletion success state)
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error deleting workout:', error);
      setWorkoutError('Failed to delete workout. Please try again.');
    }
  };

  // Function to open edit modal
  const openEditModal = (workout) => {
    setSelectedWorkout(workout);
    setEditFormData({
      planName: workout.planName,
      goal: workout.goal || '',
      level: workout.level || 'beginner',
      durationWeeks: workout.durationWeeks || 4,
      workoutsPerWeek: workout.workoutsPerWeek || 3,
    });
    setEditErrors({});
    setUpdateError('');
    setUpdateSuccess(false);
    setIsEditModalOpen(true);
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedWorkout(null);
    setTimeout(() => {
      setUpdateSuccess(false);
      setUpdateError('');
    }, 300);
  };

  // Handle changes in edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (updateError) setUpdateError('');
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!editFormData.planName.trim()) {
      newErrors.planName = 'Workout name is required';
      isValid = false;
    }
    
    if (!editFormData.level) {
      newErrors.level = 'Please select a difficulty level';
      isValid = false;
    }
    
    if (editFormData.durationWeeks < 1 || editFormData.durationWeeks > 52) {
      newErrors.durationWeeks = 'Duration must be between 1 and 52 weeks';
      isValid = false;
    }
    
    if (editFormData.workoutsPerWeek < 1 || editFormData.workoutsPerWeek > 7) {
      newErrors.workoutsPerWeek = 'Workouts per week must be between 1 and 7';
      isValid = false;
    }
    
    setEditErrors(newErrors);
    return isValid;
  };

  // Handle edit form submission
  const handleUpdateWorkout = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) return;
    
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);
    
    try {
      // Convert string numbers to actual numbers
      const workoutData = {
        ...editFormData,
        durationWeeks: Number(editFormData.durationWeeks),
        workoutsPerWeek: Number(editFormData.workoutsPerWeek)
      };
      
      const token = getAuthToken();
      const request = publicRequest();
      
      // Add auth token to request header
      if (token) {
        request.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request.put(`/workouts/${selectedWorkout._id}`, workoutData);
      
      // Update the workout in the list
      setExistingWorkouts(prev => 
        prev.map(workout => 
          workout._id === selectedWorkout._id ? response.data : workout
        )
      );
      
      // Show success message
      setUpdateSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        closeEditModal();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating workout:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update workout. Please try again.';
      setUpdateError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">Workout Planner</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create custom workout routines tailored to your fitness goals and track your progress
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Create Workout Form - First column */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Create New Workout</h2>
              </div>
              
              {generalError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{generalError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border-l-4 border-green-500">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Workout created successfully!</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Plan Name */}
                <div>
                  <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-2">
                    Workout Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="planName"
                    type="text"
                    name="planName"
                    placeholder="e.g. Summer Strength Program"
                    value={formData.planName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${
                      errors.planName 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 transition-colors duration-200 shadow-sm`}
                    required
                  />
                  {errors.planName && <p className="mt-2 text-sm text-red-600">{errors.planName}</p>}
                </div>
                
                {/* Goal */}
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness Goal
                  </label>
                  <div className="relative">
                    <select
                      id="goal"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 transition-colors duration-200 shadow-sm appearance-none"
                    >
                      {goalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Level */}
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-3">
                    Difficulty Level <span className="text-red-500">*</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {levelOptions.map(option => (
                      <div key={option.value} className="relative">
                        <input
                          type="radio"
                          id={`level-${option.value}`}
                          name="level"
                          value={option.value}
                          checked={formData.level === option.value}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={`level-${option.value}`}
                          className={`flex items-center justify-center px-3 py-3 rounded-xl cursor-pointer border transition-all duration-200
                            ${formData.level === option.value 
                              ? option.value === 'beginner' 
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/30'
                                : option.value === 'intermediate'
                                  ? 'bg-amber-100 border-amber-500 text-amber-800 ring-2 ring-amber-500/30'
                                  : 'bg-rose-100 border-rose-500 text-rose-800 ring-2 ring-rose-500/30'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } font-medium w-full text-center shadow-sm peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-opacity-50 peer-focus:outline-none`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.level && <p className="mt-2 text-sm text-red-600">{errors.level}</p>}
                </div>
                
                {/* Duration and Frequency in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration Weeks */}
                  <div>
                    <label htmlFor="durationWeeks" className="block text-sm font-medium text-gray-700 mb-2">
                      Program Duration <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="durationWeeks"
                        name="durationWeeks"
                        value={formData.durationWeeks}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${
                          errors.durationWeeks 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200 shadow-sm appearance-none`}
                        required
                      >
                        {weekOptions.map(weeks => (
                          <option key={weeks} value={weeks}>{weeks} {weeks === 1 ? 'week' : 'weeks'}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {errors.durationWeeks && <p className="mt-2 text-sm text-red-600">{errors.durationWeeks}</p>}
                  </div>
                  
                  {/* Workouts Per Week */}
                  <div>
                    <label htmlFor="workoutsPerWeek" className="block text-sm font-medium text-gray-700 mb-2">
                      Workouts Per Week <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="workoutsPerWeek"
                        name="workoutsPerWeek"
                        value={formData.workoutsPerWeek}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${
                          errors.workoutsPerWeek 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200 shadow-sm appearance-none`}
                        required
                      >
                        {daysPerWeekOptions.map(days => (
                          <option key={days} value={days}>{days} {days === 1 ? 'day' : 'days'} per week</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {errors.workoutsPerWeek && <p className="mt-2 text-sm text-red-600">{errors.workoutsPerWeek}</p>}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-col items-center mb-6 bg-blue-50 rounded-xl p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">
                      After creating your workout, you'll be able to add exercises to each workout day.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-6 py-3 rounded-xl font-medium text-white ${
                        isLoading 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg'
                      } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create Workout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Existing Workouts List - Second column */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Your Workout Plans</h2>
              </div>
              
              {workoutError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{workoutError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoadingWorkouts ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">Loading your workout plans...</p>
                </div>
              ) : existingWorkouts.length > 0 ? (
                <div className="overflow-hidden">
                  {/* Mobile view - workout cards */}
                  <div className="lg:hidden space-y-4">
                    {existingWorkouts.map(workout => (
                      <div key={workout._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{workout.planName}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(workout.level)}`}>
                              {getLevelLabel(workout.level)}
                            </span>
                          </div>
                          
                          <div className="mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Goal:</span>
                              <span className="text-gray-800 font-medium">{getGoalLabel(workout.goal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span className="text-gray-800 font-medium">{workout.durationWeeks || '?'} weeks</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Frequency:</span>
                              <span className="text-gray-800 font-medium">{workout.workoutsPerWeek || '?'} days/week</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Created:</span>
                              <span className="text-gray-800 font-medium">{formatDate(workout.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Link to={`/workouts/${workout._id}`} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                              View
                            </Link>
                            <button 
                              onClick={() => openEditModal(workout)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteWorkout(workout._id)} 
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop view - table */}
                  <div className="hidden lg:block -mx-4 -my-2 overflow-x-auto">
                    <div className="inline-block min-w-full py-2 align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Workout Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Level
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Goal
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {existingWorkouts.map(workout => (
                            <tr key={workout._id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                    {workout.planName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{workout.planName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(workout.level)}`}>
                                  {getLevelLabel(workout.level)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {getGoalLabel(workout.goal)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <div className="flex items-center">
                                  <svg className="mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                  {workout.durationWeeks || '?'} weeks ({workout.workoutsPerWeek || '?'}/wk)
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {formatDate(workout.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Link 
                                    to={`/workouts/${workout._id}`} 
                                    className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg flex items-center hover:bg-blue-100 transition-colors"
                                  >
                                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    View
                                  </Link>
                                  <button 
                                    onClick={() => openEditModal(workout)}
                                    className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg flex items-center hover:bg-indigo-100 transition-colors"
                                  >
                                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWorkout(workout._id)}
                                    className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg flex items-center hover:bg-red-100 transition-colors"
                                  >
                                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No Workout Plans Yet</h3>
                  <p className="text-gray-600 max-w-md mb-6">
                    Create your first workout plan to start tracking your fitness journey and reaching your goals.
                  </p>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => document.getElementById('planName').focus()}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                      </svg>
                      Create Your First Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Workout Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={closeEditModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Edit Workout</h3>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="bg-white rounded-full p-1 hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {updateError && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{updateError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {updateSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">Workout updated successfully!</p>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleUpdateWorkout}>
                  {/* Plan Name */}
                  <div>
                    <label htmlFor="edit-planName" className="block text-sm font-medium text-gray-700 mb-1">
                      Workout Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-planName"
                      type="text"
                      name="planName"
                      value={editFormData.planName}
                      onChange={handleEditChange}
                      className={`w-full px-3 py-2 rounded-lg bg-gray-50 border ${
                        editErrors.planName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 transition-colors duration-200`}
                    />
                    {editErrors.planName && <p className="mt-1 text-sm text-red-600">{editErrors.planName}</p>}
                  </div>
                  
                  {/* Goal */}
                  <div>
                    <label htmlFor="edit-goal" className="block text-sm font-medium text-gray-700 mb-1">
                      Fitness Goal
                    </label>
                    <div className="relative">
                      <select
                        id="edit-goal"
                        name="goal"
                        value={editFormData.goal}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 transition-colors duration-200 appearance-none"
                      >
                        {goalOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Level */}
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level <span className="text-red-500">*</span>
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      {levelOptions.map(option => (
                        <div key={option.value} className="relative">
                          <input
                            type="radio"
                            id={`edit-level-${option.value}`}
                            name="level"
                            value={option.value}
                            checked={editFormData.level === option.value}
                            onChange={handleEditChange}
                            className="sr-only peer"
                          />
                          <label
                            htmlFor={`edit-level-${option.value}`}
                            className={`flex items-center justify-center px-3 py-2 rounded-lg cursor-pointer border transition-all duration-200
                              ${editFormData.level === option.value 
                                ? option.value === 'beginner' 
                                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                                  : option.value === 'intermediate'
                                    ? 'bg-amber-100 border-amber-500 text-amber-800'
                                    : 'bg-rose-100 border-rose-500 text-rose-800'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } font-medium w-full text-center shadow-sm`}
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {editErrors.level && <p className="mt-1 text-sm text-red-600">{editErrors.level}</p>}
                  </div>
                  
                  {/* Duration and Frequency */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration Weeks */}
                    <div>
                      <label htmlFor="edit-durationWeeks" className="block text-sm font-medium text-gray-700 mb-1">
                        Program Duration <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="edit-durationWeeks"
                          name="durationWeeks"
                          value={editFormData.durationWeeks}
                          onChange={handleEditChange}
                          className={`w-full px-3 py-2 rounded-lg bg-gray-50 border ${
                            editErrors.durationWeeks 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 transition-colors duration-200 appearance-none`}
                        >
                          {weekOptions.map(weeks => (
                            <option key={weeks} value={weeks}>{weeks} {weeks === 1 ? 'week' : 'weeks'}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      {editErrors.durationWeeks && <p className="mt-1 text-sm text-red-600">{editErrors.durationWeeks}</p>}
                    </div>
                    
                    {/* Workouts Per Week */}
                    <div>
                      <label htmlFor="edit-workoutsPerWeek" className="block text-sm font-medium text-gray-700 mb-1">
                        Workouts Per Week <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="edit-workoutsPerWeek"
                          name="workoutsPerWeek"
                          value={editFormData.workoutsPerWeek}
                          onChange={handleEditChange}
                          className={`w-full px-3 py-2 rounded-lg bg-gray-50 border ${
                            editErrors.workoutsPerWeek 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 transition-colors duration-200 appearance-none`}
                        >
                          {daysPerWeekOptions.map(days => (
                            <option key={days} value={days}>{days} {days === 1 ? 'day' : 'days'} per week</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      {editErrors.workoutsPerWeek && <p className="mt-1 text-sm text-red-600">{editErrors.workoutsPerWeek}</p>}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className={`px-4 py-2 font-medium rounded-lg text-white ${
                        isUpdating 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-md'
                      } transition-all duration-200 flex items-center`}
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : 'Update Workout'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkout;
