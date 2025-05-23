import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicRequest } from '../hooks/requestMethods';

const CreateExercise = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    equipment: '',
    instructions: '',
    video_url: '',
    image_url: ''
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  // Category options for dropdown
  const categoryOptions = [
    { value: '', label: 'Select category' },
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'arms', label: 'Arms' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'forearms', label: 'Forearms' },
    { value: 'legs', label: 'Legs' },
    { value: 'glutes', label: 'Glutes' },
    { value: 'calves', label: 'Calves' },
    { value: 'core', label: 'Core' },
    { value: 'abs', label: 'Abs' },
    { value: 'obliques', label: 'Obliques' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'fullbody', label: 'Full Body' },
    { value: 'mobility', label: 'Mobility / Stretching' }
];


  // Equipment options for dropdown
  const equipmentOptions = [
    { value: '', label: 'Select equipment' },
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'cable', label: 'Cable Machine' },
    { value: 'machine', label: 'Machine' },
    { value: 'resistance bands', label: 'Resistance Bands' },
    { value: 'other', label: 'Other' }
  ];

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Exercise name is required';
      isValid = false;
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
      isValid = false;
    }
    
    if (formData.video_url && !isValidUrl(formData.video_url)) {
      newErrors.video_url = 'Please enter a valid URL';
      isValid = false;
    }
    
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setGeneralError('');
    setSuccess(false);
    
    try {
      const request = publicRequest();
      await request.post('/exercises', formData);
      
      // Show success message
      setSuccess(true);
      
      // Clear form after successful submission
      setFormData({
        name: '',
        category: '',
        equipment: '',
        instructions: '',
        video_url: '',
        image_url: ''
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating exercise:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create exercise. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Exercise</h1>
          <p className="text-gray-600">Add a new exercise to the MuscleMap database</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 backdrop-blur-sm bg-opacity-95 border border-gray-100">
          {generalError && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {generalError}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
              Exercise created successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exercise Name */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                Exercise Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="e.g. Barbell Bench Press"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                  errors.category 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
                required
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>
            
            {/* Equipment */}
            <div>
              <label htmlFor="equipment" className="block mb-2 text-sm font-medium text-gray-700">
                Equipment
              </label>
              <select
                id="equipment"
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 transition-colors duration-200"
              >
                {equipmentOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block mb-2 text-sm font-medium text-gray-700">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                placeholder="Step-by-step instructions for performing this exercise..."
                value={formData.instructions}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 transition-colors duration-200"
              ></textarea>
            </div>
            
            {/* Video URL */}
            <div>
              <label htmlFor="video_url" className="block mb-2 text-sm font-medium text-gray-700">
                Video URL
              </label>
              <input
                id="video_url"
                type="url"
                name="video_url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                  errors.video_url 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
              />
              {errors.video_url && <p className="mt-1 text-sm text-red-500">{errors.video_url}</p>}
            </div>
            
            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block mb-2 text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                id="image_url"
                type="url"
                name="image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border ${
                  errors.image_url 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
              />
              {errors.image_url && <p className="mt-1 text-sm text-red-500">{errors.image_url}</p>}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isLoading 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'cursor-pointer'
                } bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 flex items-center`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Exercise'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExercise;
