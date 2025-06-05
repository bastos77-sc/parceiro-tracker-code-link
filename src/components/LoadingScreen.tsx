
import React from 'react';
import { MapPin } from "lucide-react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
