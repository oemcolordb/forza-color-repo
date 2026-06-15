import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'lg', className = '' }) => {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-[color:var(--bamboo-stalk)] ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
