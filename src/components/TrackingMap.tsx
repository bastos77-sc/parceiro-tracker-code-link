
import React, { useState } from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import GoogleMap from './GoogleMap';

interface TrackingMapProps {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

const TrackingMap: React.FC<TrackingMapProps> = ({ location }) => {
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);

  if (useGoogleMaps) {
    return <GoogleMap location={location} />;
  }

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
          <div className="absolute -inset-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -inset-2 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
          
          {/* Ícone principal */}
          <div className="relative w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          
          {/* Badge de tempo real */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <Clock className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* Informações da localização */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20">
          <div className="flex items-start space-x-3">
            <Navigation className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 mb-1">Localização em Tempo Real</p>
              <p className="text-sm text-gray-600 mb-2 break-words">{location.address}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <p>Lat: {location.lat.toFixed(6)}</p>
                <p>Lng: {location.lng.toFixed(6)}</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Atualização automática</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setUseGoogleMaps(true)}
            className="mt-3 w-full px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            Usar Google Maps
          </button>
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
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Precisão: Alta</span>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
