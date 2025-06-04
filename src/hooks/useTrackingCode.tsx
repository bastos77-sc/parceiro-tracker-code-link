
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useTrackingCode = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectPartner = async (trackingCode: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para conectar com um parceiro",
        variant: "destructive",
      });
      return false;
    }

    if (!trackingCode.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um código de rastreamento",
        variant: "destructive",
      });
      return false;
    }

    setIsConnecting(true);
    console.log('Attempting to connect with tracking code:', trackingCode);
    console.log('Current user ID:', user.id);

    try {
      // First, find the profile with this tracking code
      const { data: partnerProfile, error: findError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('tracking_code', trackingCode.trim())
        .maybeSingle();

      console.log('Partner profile search result:', partnerProfile, findError);

      if (findError) {
        console.error('Error finding partner:', findError);
        toast({
          title: "Erro",
          description: "Erro ao buscar parceiro. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      if (!partnerProfile) {
        toast({
          title: "Código não encontrado",
          description: "Nenhum usuário encontrado com este código de rastreamento",
          variant: "destructive",
        });
        return false;
      }

      if (partnerProfile.id === user.id) {
        toast({
          title: "Erro",
          description: "Você não pode conectar com você mesmo",
          variant: "destructive",
        });
        return false;
      }

      // Check if relationship already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('tracking_relationships')
        .select('id')
        .eq('tracker_id', user.id)
        .eq('tracked_id', partnerProfile.id)
        .maybeSingle();

      console.log('Existing relationship check:', existingRelation, checkError);

      if (checkError) {
        console.error('Error checking existing relationship:', checkError);
        toast({
          title: "Erro",
          description: "Erro ao verificar relacionamento existente",
          variant: "destructive",
        });
        return false;
      }

      if (existingRelation) {
        toast({
          title: "Parceiro já conectado",
          description: `Você já está conectado com ${partnerProfile.name || partnerProfile.email}`,
        });
        return true;
      }

      // Create the tracking relationship
      const { error: createError } = await supabase
        .from('tracking_relationships')
        .insert({
          tracker_id: user.id,
          tracked_id: partnerProfile.id
        });

      console.log('Create relationship result:', createError);

      if (createError) {
        console.error('Error creating tracking relationship:', createError);
        toast({
          title: "Erro",
          description: "Erro ao criar relacionamento de rastreamento",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Parceiro conectado!",
        description: `Agora você pode rastrear ${partnerProfile.name || partnerProfile.email}`,
      });

      return true;
    } catch (error) {
      console.error('Unexpected error connecting partner:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao conectar parceiro",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    connectPartner,
    isConnecting
  };
};
