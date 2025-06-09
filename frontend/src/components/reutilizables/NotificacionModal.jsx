'use client'
import React, { useEffect } from 'react';

const NotificationModal = ({ message, isVisible, type, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      case 'success':
        return 'bg-yellow-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div
      className={`fixed top-0 left-1/4 w-1/2 h-10 z-[99] flex items-center justify-between px-4 text-white ${getBgColor()} transform transition-transform duration-300 rounded-b-lg ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <p>{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

export default NotificationModal;