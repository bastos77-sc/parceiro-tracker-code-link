
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
    console.log('Fetching partner location for user:', user.id);

    try {
      // First get the tracking relationships to find tracked users
      const { data: relationships, error: relationshipError } = await supabase
        .from('tracking_relationships')
        .select('tracked_id')
        .eq('tracker_id', user.id);

      if (relationshipError) {
        console.error('Error fetching tracking relationships:', relationshipError);
        setError("Erro ao buscar relacionamentos de rastreamento");
        return;
      }

      if (!relationships || relationships.length === 0) {
        console.log('No tracking relationships found');
        setPartnerLocation(null);
        return;
      }

      // Get the tracked user IDs
      const trackedUserIds = relationships.map(rel => rel.tracked_id);

      // Get the latest location of tracked partners
      const { data, error: fetchError } = await supabase
        .from('user_locations')
        .select(`
          id,
          latitude,
          longitude,
          address,
          timestamp,
          user_id,
          profiles!user_locations_user_id_fkey (
            name,
            email
          )
        `)
        .in('user_id', trackedUserIds)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('Partner location query result:', data, fetchError);

      if (fetchError) {
        console.error('Error fetching partner location:', fetchError);
        setError("Erro ao buscar localização do parceiro");
        return;
      }

      if (data && data.profiles) {
        const location: PartnerLocation = {
          id: data.id,
          name: data.profiles.name || '',
          email: data.profiles.email || '',
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          address: data.address,
          timestamp: data.timestamp
        };
        
        console.log('Setting partner location:', location);
        setPartnerLocation(location);
      } else {
        console.log('No partner location found');
        setPartnerLocation(null);
      }
    } catch (err) {
      console.error('Unexpected error fetching partner location:', err);
      setError("Erro inesperado ao buscar localização");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPartnerLocation();
    }
  }, [user]);

  return {
    partnerLocation,
    loading,
    error,
    refetch: fetchPartnerLocation
  };
};
