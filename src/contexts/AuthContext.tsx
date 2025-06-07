
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Função para gerar código único de rastreamento
const generateUniqueTrackingCode = async (): Promise<string> => {
  let isUnique = false;
  let trackingCode = '';
  
  while (!isUnique) {
    const prefix = 'PRT';
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    trackingCode = `${prefix}-${randomNumber}`;
    
    // Verificar se o código já existe
    const { data: existingCode } = await supabase
      .from('profiles')
      .select('tracking_code')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (!existingCode) {
      isUnique = true;
    }
  }
  
  return trackingCode;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create or verify profile when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('=== VERIFICANDO/CRIANDO PERFIL ===');
          console.log('User signed in, checking profile for:', session.user.id);
          
          setTimeout(async () => {
            try {
              // Verificar se o perfil já existe
              const { data: existingProfile, error: profileCheckError } = await supabase
                .from('profiles')
                .select('id, tracking_code, email, name')
                .eq('id', session.user.id)
                .maybeSingle();
              
              console.log('Perfil existente encontrado:', existingProfile);
              console.log('Erro ao verificar perfil:', profileCheckError);
              
              if (profileCheckError && profileCheckError.code !== 'PGRST116') {
                console.error('Erro ao buscar perfil:', profileCheckError);
                return;
              }
              
              if (!existingProfile) {
                // Criar novo perfil com código único
                console.log('=== CRIANDO PERFIL PARA NOVO USUÁRIO ===');
                
                const newTrackingCode = await generateUniqueTrackingCode();
                console.log('Código de rastreamento gerado:', newTrackingCode);
                
                const { data: insertedProfile, error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || '',
                    tracking_code: newTrackingCode,
                    is_tracking_active: true
                  })
                  .select()
                  .single();
                
                console.log('Perfil inserido:', insertedProfile);
                console.log('Erro ao inserir perfil:', insertError);
                
                if (insertError) {
                  console.error('Error creating profile:', insertError);
                } else {
                  console.log('Profile created successfully with tracking code:', newTrackingCode);
                }
              } else if (!existingProfile.tracking_code) {
                // Atualizar perfil existente que não tem tracking_code
                console.log('=== ATUALIZANDO PERFIL SEM TRACKING CODE ===');
                
                const newTrackingCode = await generateUniqueTrackingCode();
                console.log('Gerando código para perfil existente:', newTrackingCode);
                
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ tracking_code: newTrackingCode })
                  .eq('id', session.user.id);
                
                if (updateError) {
                  console.error('Erro ao atualizar tracking code:', updateError);
                } else {
                  console.log('Tracking code atualizado com sucesso:', newTrackingCode);
                }
              } else {
                console.log('Perfil já existe com tracking code:', existingProfile.tracking_code);
              }
            } catch (error) {
              console.error('Erro inesperado ao gerenciar perfil:', error);
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== VERIFICAÇÃO DE SESSÃO INICIAL ===');
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    console.log('=== INICIANDO CADASTRO ===');
    console.log('Email:', email);
    console.log('Nome:', name);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name || ''
        }
      }
    });
    
    console.log('Resultado do cadastro - erro:', error);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('=== INICIANDO LOGIN ===');
    console.log('Email:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('Resultado do login - erro:', error);
    return { error };
  };

  const signOut = async () => {
    console.log('=== FAZENDO LOGOUT ===');
    const { error } = await supabase.auth.signOut();
    console.log('Resultado do logout - erro:', error);
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
