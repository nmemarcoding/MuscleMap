import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicRequest } from '../hooks/requestMethods';
import ExerciseDetailModal from '../components/ExerciseDetailModal';

const ExerciseBrowser = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    equipment: ''
  });
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Add state for tracking image load errors
  const [imageErrors, setImageErrors] = useState({});

  // Category options for filtering
  const categoryOptions = [
    { value: '', label: 'All Categories' },
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

  // Equipment options for filtering
  const equipmentOptions = [
    { value: '', label: 'All Equipment' },
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'cable', label: 'Cable Machine' },
    { value: 'machine', label: 'Machine' },
    { value: 'resistance bands', label: 'Resistance Bands' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const request = publicRequest();
        const response = await request.get('/exercises');
        setExercises(response.data);
        setFilteredExercises(response.data);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Apply filters and search when any of these values change
  useEffect(() => {
    let result = exercises;
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(exercise => exercise.category === filters.category);
    }
    
    // Apply equipment filter
    if (filters.equipment) {
      result = result.filter(exercise => exercise.equipment === filters.equipment);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(exercise => 
        exercise.name.toLowerCase().includes(lowerCaseSearchTerm) || 
        (exercise.instructions && exercise.instructions.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    
    setFilteredExercises(result);
  }, [exercises, filters, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      equipment: ''
    });
    setSearchTerm('');
  };

  const openExerciseDetails = (exercise) => {
    setSelectedExercise(exercise);
  };

  const closeExerciseDetails = () => {
    setSelectedExercise(null);
  };

  const handleImageError = (exerciseId) => {
    setImageErrors(prev => ({
      ...prev,
      [exerciseId]: true
    }));
  };

  // Placeholder image when no image is provided
  const placeholderImage = "https://via.placeholder.com/300x200?text=Exercise";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exercise Library</h1>
          <p className="text-gray-600">Browse our collection of exercises to build your perfect workout</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 backdrop-blur-sm bg-opacity-95 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block mb-2 text-sm font-medium text-gray-700">
                Search Exercises
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2.5 pl-10 rounded-lg bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-700">
                Filter by Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 transition-colors duration-200"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Equipment Filter */}
            <div>
              <label htmlFor="equipment" className="block mb-2 text-sm font-medium text-gray-700">
                Filter by Equipment
              </label>
              <select
                id="equipment"
                name="equipment"
                value={filters.equipment}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 transition-colors duration-200"
              >
                {equipmentOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter status and clear button */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredExercises.length === 0
                ? 'No exercises found'
                : filteredExercises.length === 1
                  ? '1 exercise found'
                  : `${filteredExercises.length} exercises found`}
            </div>
            {(filters.category || filters.equipment || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-600 hover:bg-indigo-50 rounded-md transition-colors duration-150"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin"></div>
            <span className="ml-3 text-gray-700">Loading exercises...</span>
          </div>
        )}

        {/* Exercise Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.length > 0 ? (
              filteredExercises.map(exercise => (
                <div 
                  key={exercise._id} 
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    {!imageErrors[exercise._id] ? (
                      <img
                        src={exercise.image_url || ''}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(exercise._id)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{exercise.name}</h3>
                    
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {exercise.category && (
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full">
                          {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                        </span>
                      )}
                      {exercise.equipment && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full">
                          {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => openExerciseDetails(exercise)}
                      className="inline-block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No exercises found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Link
                  to="/exercises/create"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300"
                >
                  Create New Exercise
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Create New Exercise Button (Bottom) */}
        {!isLoading && !error && filteredExercises.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/exercises/create"
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Exercise
            </Link>
          </div>
        )}

        {/* Exercise Detail Modal */}
        {selectedExercise && (
          <ExerciseDetailModal 
            exercise={selectedExercise} 
            onClose={closeExerciseDetails} 
          />
        )}
      </div>
    </div>
  );
};

export default ExerciseBrowser;
