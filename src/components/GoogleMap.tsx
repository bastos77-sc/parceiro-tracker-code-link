
import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAqU2dWwLJqir9wGJr-X1bN7wLYO90qgGo&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 15,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: 'Localização do Parceiro',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="#FFFFFF" stroke-width="4"/>
              <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">Localização do Parceiro</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${location.address}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    };

    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && window.google) {
      const newPosition = { lat: location.lat, lng: location.lng };
      
      mapInstanceRef.current.setCenter(newPosition);
      markerRef.current.setPosition(newPosition);
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">Localização do Parceiro</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${location.address}</p>
          </div>
        `
      });

      markerRef.current.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      });
    }
  }, [location]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">Localização Atual</p>
            <p className="text-xs text-gray-600">{location.address}</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium shadow-lg">
        ● Google Maps
      </div>
    </div>
  );
};

export default GoogleMap;
