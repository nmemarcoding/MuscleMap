import React, { useRef, useEffect, useState } from 'react';

const ExerciseDetailModal = ({ exercise, onClose }) => {
  const modalRef = useRef();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      e.target.src = '';
      e.target.alt = 'Image not available';
      e.target.className = `${e.target.className} bg-gray-200 flex items-center justify-center text-gray-500`;
      e.target.style.minHeight = '200px';
      e.target.style.display = 'flex';
      e.target.style.alignItems = 'center';
      e.target.style.justifyContent = 'center';
      const textDiv = document.createElement('div');
      textDiv.textContent = 'No image available';
      textDiv.className = 'text-gray-500 text-center';
      e.target.appendChild(textDiv);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Modal header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{exercise.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Image and tags */}
            <div>
              <div className="rounded-lg overflow-hidden border border-gray-200 mb-4 h-64">
                {!imageError ? (
                  <img
                    src={exercise.image_url || ''}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {exercise.category && (
                  <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                    {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                  </span>
                )}
                {exercise.equipment && (
                  <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                    {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Right column: Instructions and video */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h3>
                {exercise.instructions ? (
                  <p className="text-gray-700 whitespace-pre-line">{exercise.instructions}</p>
                ) : (
                  <p className="text-gray-500 italic">No instructions available</p>
                )}
              </div>

              {exercise.video_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Video</h3>
                  <div className="mb-4">
                    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                      <iframe
                        src={exercise.video_url.replace('watch?v=', 'embed/')}
                        title="Exercise video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailModal;
