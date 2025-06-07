
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);

  // Função para obter endereço via reverse geocoding
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      // Usando a API do OpenStreetMap Nominatim (gratuita)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Função para salvar localização no banco
  const saveLocationToDatabase = async (locationData: GeolocationData) => {
    if (!user) {
      console.log('Usuário não autenticado, não salvando localização');
      return;
    }

    try {
      const address = await getAddressFromCoords(locationData.latitude, locationData.longitude);
      
      const { error } = await supabase
        .from('user_locations')
        .insert({
          user_id: user.id,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: address,
          timestamp: locationData.timestamp
        });

      if (error) {
        console.error('Erro ao salvar localização:', error);
      } else {
        console.log('Localização salva com sucesso:', locationData);
      }
    } catch (error) {
      console.error('Erro inesperado ao salvar localização:', error);
    }
  };

  // Iniciar rastreamento
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada por este navegador');
      return;
    }

    if (isTracking) {
      console.log('Rastreamento já está ativo');
      return;
    }

    console.log('Iniciando rastreamento de localização...');
    setIsTracking(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // Cache por 30 segundos
    };

    // Obter localização inicial
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        console.log('Localização inicial obtida:', locationData);
        setLocation(locationData);
        saveLocationToDatabase(locationData);
      },
      (error) => {
        console.error('Erro ao obter localização inicial:', error);
        setError(`Erro de geolocalização: ${error.message}`);
        setIsTracking(false);
      },
      options
    );

    // Monitorar mudanças de localização
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        console.log('Localização atualizada:', locationData);
        setLocation(locationData);
        saveLocationToDatabase(locationData);
      },
      (error) => {
        console.error('Erro no rastreamento contínuo:', error);
        setError(`Erro de rastreamento: ${error.message}`);
      },
      options
    );
  };

  // Parar rastreamento
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    console.log('Rastreamento de localização parado');
  };

  // Cleanup quando componente é desmontado
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking
  };
};
