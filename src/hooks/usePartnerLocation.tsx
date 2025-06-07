
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PartnerLocation {
  id: string;
  name: string;
  email: string;
  latitude: number;
  longitude: number;
  address: string | null;
  timestamp: string;
  accuracy?: number;
}

export const usePartnerLocation = () => {
  const [partnerLocation, setPartnerLocation] = useState<PartnerLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPartnerLocation = async () => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);
    console.log('=== BUSCANDO LOCALIZAÇÃO DO PARCEIRO ===');
    console.log('ID do usuário atual:', user.id);

    try {
      // Buscar relacionamentos de rastreamento
      const { data: relationships, error: relationshipError } = await supabase
        .from('tracking_relationships')
        .select('tracked_id, profiles!tracking_relationships_tracked_id_fkey(name, email)')
        .eq('tracker_id', user.id);

      console.log('Relacionamentos encontrados:', relationships);

      if (relationshipError) {
        console.error('Erro ao buscar relacionamentos:', relationshipError);
        setError("Erro ao buscar relacionamentos de rastreamento");
        return;
      }

      if (!relationships || relationships.length === 0) {
        console.log('Nenhum relacionamento de rastreamento encontrado');
        setPartnerLocation(null);
        return;
      }

      // Obter IDs dos usuários rastreados
      const trackedUserIds = relationships.map(rel => rel.tracked_id);
      console.log('IDs dos usuários rastreados:', trackedUserIds);

      // Buscar a localização mais recente dos parceiros rastreados
      const { data: locations, error: locationError } = await supabase
        .from('user_locations')
        .select(`
          id,
          latitude,
          longitude,
          address,
          timestamp,
          user_id
        `)
        .in('user_id', trackedUserIds)
        .order('timestamp', { ascending: false })
        .limit(1);

      console.log('Localizações encontradas:', locations);

      if (locationError) {
        console.error('Erro ao buscar localizações:', locationError);
        setError("Erro ao buscar localização do parceiro");
        return;
      }

      if (locations && locations.length > 0) {
        const latestLocation = locations[0];
        
        // Encontrar o perfil correspondente
        const partnerProfile = relationships.find(rel => rel.tracked_id === latestLocation.user_id);
        
        if (partnerProfile && partnerProfile.profiles) {
          const location: PartnerLocation = {
            id: latestLocation.id,
            name: partnerProfile.profiles.name || 'Usuário',
            email: partnerProfile.profiles.email || '',
            latitude: Number(latestLocation.latitude),
            longitude: Number(latestLocation.longitude),
            address: latestLocation.address,
            timestamp: latestLocation.timestamp
          };
          
          console.log('Localização do parceiro processada:', location);
          setPartnerLocation(location);
        } else {
          console.log('Perfil do parceiro não encontrado');
          setPartnerLocation(null);
        }
      } else {
        console.log('Nenhuma localização encontrada para os parceiros');
        setPartnerLocation(null);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar localização:', err);
      setError("Erro inesperado ao buscar localização");
    } finally {
      setLoading(false);
    }
  };

  // Configurar atualizações em tempo real
  useEffect(() => {
    if (user) {
      fetchPartnerLocation();

      // Configurar listener para atualizações em tempo real
      const channel = supabase
        .channel('partner-location-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_locations'
          },
          (payload) => {
            console.log('Nova localização recebida via realtime:', payload);
            // Recarregar dados quando houver nova localização
            fetchPartnerLocation();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_locations'
          },
          (payload) => {
            console.log('Localização atualizada via realtime:', payload);
            fetchPartnerLocation();
          }
        )
        .subscribe();

      // Configurar polling para atualizações regulares (fallback)
      const interval = setInterval(() => {
        console.log('Atualizando localização do parceiro (polling)...');
        fetchPartnerLocation();
      }, 30000); // Atualizar a cada 30 segundos

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [user]);

  return {
    partnerLocation,
    loading,
    error,
    refetch: fetchPartnerLocation
  };
};
