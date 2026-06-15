import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  message,
  spinnerSize = 'xl',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center"
          >
            <LoadingSpinner size={spinnerSize} />

            {message && (
              <p className="mt-4 text-lg font-medium text-white shadow-black drop-shadow-md animate-pulse">
                {message}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
