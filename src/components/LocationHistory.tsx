
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Car, Home, Building } from 'lucide-react';

const LocationHistory = () => {
  const historyData = [
    {
      id: 1,
      location: "Shopping Center Plaza",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      time: "14:30",
      duration: "2h 15min",
      type: "shopping",
      icon: Building
    },
    {
      id: 2,
      location: "Restaurante Bella Vista",
      address: "Rua Augusta, 500 - São Paulo, SP",
      time: "12:00",
      duration: "1h 30min",
      type: "restaurant",
      icon: Building
    },
    {
      id: 3,
      location: "Academia Fitness Plus",
      address: "Rua Consolação, 200 - São Paulo, SP",
      time: "09:30",
      duration: "1h 45min",
      type: "gym",
      icon: Building
    },
    {
      id: 4,
      location: "Casa",
      address: "Rua das Flores, 123 - São Paulo, SP",
      time: "07:00",
      duration: "2h 30min",
      type: "home",
      icon: Home
    },
  ];

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'home':
        return 'bg-green-100 text-green-800';
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'shopping':
        return 'bg-purple-100 text-purple-800';
      case 'restaurant':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Histórico de Hoje</h3>
      </div>

      <div className="space-y-3">
        {historyData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getLocationColor(item.type)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.location}
                      </h4>
                      <span className="text-sm text-gray-500">{item.time}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{item.address}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Duração: {item.duration}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {index < historyData.length - 1 && (
                  <div className="ml-5 mt-3 h-4 border-l-2 border-gray-200"></div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Ver histórico completo
        </button>
      </div>
    </div>
  );
};

export default LocationHistory;
