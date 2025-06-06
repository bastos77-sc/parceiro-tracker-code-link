
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProfileSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const setupUserProfile = async () => {
      if (!user) return;

      console.log('Verificando perfil do usuário:', user.id);

      try {
        // Verificar se o perfil já existe
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao verificar perfil:', fetchError);
          return;
        }

        if (!existingProfile) {
          console.log('Perfil não encontrado, criando novo...');
          
          // Gerar código único de rastreamento
          const generateTrackingCode = () => {
            return 'PRT-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
          };

          let trackingCode = generateTrackingCode();
          let codeExists = true;

          // Verificar se o código já existe
          while (codeExists) {
            const { data: codeCheck } = await supabase
              .from('profiles')
              .select('tracking_code')
              .eq('tracking_code', trackingCode)
              .maybeSingle();

            if (!codeCheck) {
              codeExists = false;
            } else {
              trackingCode = generateTrackingCode();
            }
          }

          // Criar perfil
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || null,
              tracking_code: trackingCode,
              is_tracking_active: true
            });

          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            toast({
              title: "Erro ao criar perfil",
              description: "Não foi possível criar seu perfil. Tente fazer login novamente.",
              variant: "destructive",
            });
          } else {
            console.log('Perfil criado com sucesso:', trackingCode);
            toast({
              title: "Perfil criado!",
              description: `Seu código de rastreamento é: ${trackingCode}`,
            });
          }
        } else {
          console.log('Perfil existente encontrado:', existingProfile.tracking_code);
        }
      } catch (error) {
        console.error('Erro inesperado ao configurar perfil:', error);
      }
    };

    setupUserProfile();
  }, [user, toast]);
};
