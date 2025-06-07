
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Satellite, AlertCircle, Play, Square } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

const LocationTracker: React.FC = () => {
  const { location, error, isTracking, startTracking, stopTracking } = useGeolocation();

  // Iniciar rastreamento automaticamente quando componente é montado
  useEffect(() => {
    if (!isTracking && !error) {
      console.log('Iniciando rastreamento automático...');
      startTracking();
    }
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  const getAccuracyStatus = (accuracy?: number) => {
    if (!accuracy) return { label: 'Desconhecida', color: 'bg-gray-100 text-gray-800' };
    if (accuracy <= 10) return { label: 'Alta', color: 'bg-green-100 text-green-800' };
    if (accuracy <= 50) return { label: 'Média', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Baixa', color: 'bg-red-100 text-red-800' };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Satellite className="w-5 h-5" />
          <span>Status do Rastreamento</span>
          <Badge variant={isTracking ? 'default' : 'secondary'} className={isTracking ? 'bg-green-100 text-green-800' : ''}>
            {isTracking ? 'Ativo' : 'Inativo'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex space-x-2">
          <Button 
            onClick={startTracking} 
            disabled={isTracking}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Iniciar</span>
          </Button>
          <Button 
            onClick={stopTracking} 
            disabled={!isTracking}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Square className="w-4 h-4" />
            <span>Parar</span>
          </Button>
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Localização atual */}
        {location && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm">Localização Atual</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Latitude:</span>
                  <p className="font-mono">{location.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Longitude:</span>
                  <p className="font-mono">{location.longitude.toFixed(6)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Precisão:</span>
                  <Badge className={getAccuracyStatus(location.accuracy).color}>
                    {location.accuracy ? `${Math.round(location.accuracy)}m` : 'N/A'}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(location.timestamp)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status quando não há localização */}
        {!location && !error && isTracking && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Obtendo localização...</p>
          </div>
        )}

        {!location && !error && !isTracking && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Rastreamento desativado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationTracker;
