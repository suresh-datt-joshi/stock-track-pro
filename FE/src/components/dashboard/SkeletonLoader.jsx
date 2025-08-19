// src/components/dashboard/SkeletonLoader.jsx
import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 mb-8 max-w-lg mx-auto animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
      <div className="mt-5 flex justify-center space-x-4">
        <div className="h-12 bg-gray-300 rounded-lg w-32"></div>
        <div className="h-12 bg-gray-300 rounded-lg w-40"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
