import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (size === 'lg') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`${sizeClasses[size]} ${className} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}></div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
  );
};

export default LoadingSpinner;