
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface TrackingMapProps {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

const TrackingMap: React.FC<TrackingMapProps> = ({ location }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg relative overflow-hidden">
      {/* Mapa simulado com SVG */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {/* Linhas da grade do mapa */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4F46E5" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Ruas simuladas */}
          <path d="M 0 150 L 400 150" stroke="#6366F1" strokeWidth="3" opacity="0.6"/>
          <path d="M 200 0 L 200 300" stroke="#6366F1" strokeWidth="3" opacity="0.6"/>
          <path d="M 0 100 L 400 100" stroke="#8B5CF6" strokeWidth="2" opacity="0.4"/>
          <path d="M 100 0 L 100 300" stroke="#8B5CF6" strokeWidth="2" opacity="0.4"/>
          <path d="M 300 0 L 300 300" stroke="#8B5CF6" strokeWidth="2" opacity="0.4"/>
        </svg>
      </div>

      {/* Marcador de localização */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Círculo pulsante */}
          <div className="absolute -inset-2 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -inset-1 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
          
          {/* Ícone principal */}
          <div className="relative w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <MapPin className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Informações da localização */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <Navigation className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Localização Atual</p>
              <p className="text-sm text-gray-600">{location.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles do mapa */}
      <div className="absolute top-4 right-4 space-y-2">
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <span className="text-lg font-bold text-gray-600">+</span>
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <span className="text-lg font-bold text-gray-600">−</span>
        </button>
      </div>

      {/* Indicador de precisão */}
      <div className="absolute top-4 left-4">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          ●  Precisão: Alta
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
