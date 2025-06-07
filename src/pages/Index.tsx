import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import CodeDisplay from "@/components/CodeDisplay";
import WelcomeScreen from "@/components/WelcomeScreen";
import TrackingView from "@/components/TrackingView";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [showCodeDisplay, setShowCodeDisplay] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Hook de geolocalização para o usuário atual
  const { startTracking: startOwnTracking, stopTracking: stopOwnTracking, isTracking: isOwnTracking } = useGeolocation();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch user profile when user is loaded
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      // Iniciar rastreamento próprio automaticamente quando logado
      console.log('Usuário logado, iniciando rastreamento próprio...');
      startOwnTracking();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      console.log('=== BUSCANDO PERFIL DO USUÁRIO ===');
      console.log('Fetching user profile for:', user?.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      console.log('Query result - data:', data);
      console.log('Query result - error:', error);

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      console.log('User profile fetched successfully:', data);
      setUserProfile(data);
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
    }
  };

  const handleSignOut = async () => {
    // Parar rastreamento próprio ao sair
    stopOwnTracking();
    
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const handleTrackPartner = async (partnerCode: string) => {
    const trimmedCode = partnerCode.trim();
    
    if (!trimmedCode) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, insira o código único do seu parceiro",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('=== INICIANDO RASTREAMENTO DO PARCEIRO ===');
      console.log('Código original digitado:', `"${partnerCode}"`);
      console.log('Código após trim:', `"${trimmedCode}"`);
      console.log('Tamanho do código:', trimmedCode.length);
      console.log('ID do usuário atual:', user?.id);
      console.log('Código do usuário atual:', userProfile?.tracking_code);
      
      // Check if user is trying to track themselves
      if (userProfile?.tracking_code === trimmedCode) {
        toast({
          title: "Código inválido",
          description: "Você não pode rastrear a si mesmo",
          variant: "destructive",
        });
        return;
      }
      
      // Debug: Verificar todos os códigos existentes na base
      console.log('=== VERIFICANDO TODOS OS CÓDIGOS EXISTENTES ===');
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("id, email, name, tracking_code, is_tracking_active");
      
      console.log('Todos os perfis na base:', allProfiles);
      console.log('Erro ao buscar todos os perfis:', allProfilesError);
      
      // Find the partner by tracking code with better error handling
      console.log('=== BUSCANDO PARCEIRO PELO CÓDIGO ===');
      const { data: partnerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, name, tracking_code, is_tracking_active")
        .eq("tracking_code", trimmedCode)
        .maybeSingle();

      console.log('Query executada para código:', trimmedCode);
      console.log('Resultado da busca do parceiro:', partnerProfile);
      console.log('Erro na busca:', profileError);

      // Handle different types of errors
      if (profileError) {
        console.error('Erro no banco de dados:', profileError);
        toast({
          title: "Erro na busca",
          description: "Erro ao buscar o código no banco de dados: " + profileError.message,
          variant: "destructive",
        });
        return;
      }

      if (!partnerProfile) {
        console.log('=== CÓDIGO NÃO ENCONTRADO ===');
        console.log('Código buscado:', trimmedCode);
        
        // Mostrar códigos existentes para debug
        const existingCodes = allProfiles?.map(p => p.tracking_code).filter(Boolean) || [];
        console.log('Códigos existentes na base:', existingCodes);
        
        // Verificar se o formato está correto
        const isValidFormat = /^PRT-\d{6}$/.test(trimmedCode);
        console.log('Formato do código é válido (PRT-XXXXXX):', isValidFormat);
        
        toast({
          title: "Código não encontrado",
          description: `O código "${trimmedCode}" não foi encontrado. Verifique se está digitado corretamente (formato: PRT-123456).`,
          variant: "destructive",
        });
        return;
      }

      console.log('=== PARCEIRO ENCONTRADO ===');
      console.log('Dados do parceiro:', partnerProfile);

      if (!partnerProfile.is_tracking_active) {
        console.log('Rastreamento do parceiro está inativo');
        toast({
          title: "Rastreamento inativo",
          description: "Este usuário desativou o rastreamento",
          variant: "destructive",
        });
        return;
      }

      // Check if already tracking this user
      console.log('=== VERIFICANDO RELACIONAMENTO EXISTENTE ===');
      const { data: existingRelationship, error: relationshipCheckError } = await supabase
        .from("tracking_relationships")
        .select("id")
        .eq("tracker_id", user?.id)
        .eq("tracked_id", partnerProfile.id)
        .maybeSingle();

      console.log('Relacionamento existente:', existingRelationship);
      console.log('Erro ao verificar relacionamento:', relationshipCheckError);

      if (existingRelationship) {
        console.log('Já está rastreando este usuário');
        toast({
          title: "Já rastreando",
          description: "Você já está rastreando este usuário",
          variant: "default",
        });
        setIsTracking(true);
        await loadPartnerData(partnerProfile, trimmedCode);
        return;
      }

      // Create tracking relationship
      console.log('=== CRIANDO RELACIONAMENTO DE RASTREAMENTO ===');
      const { error: relationshipError } = await supabase
        .from("tracking_relationships")
        .insert({
          tracker_id: user?.id,
          tracked_id: partnerProfile.id
        });

      console.log('Erro ao criar relacionamento:', relationshipError);

      if (relationshipError) {
        console.error('Erro ao criar relacionamento:', relationshipError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o relacionamento de rastreamento: " + relationshipError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Relacionamento criado com sucesso');
      await loadPartnerData(partnerProfile, trimmedCode);
      
      toast({
        title: "Rastreamento iniciado!",
        description: `Agora você está rastreando ${partnerProfile.name || partnerProfile.email}`,
      });
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o rastreamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const loadPartnerData = async (partnerProfile: any, partnerCode: string) => {
    console.log('=== CARREGANDO DADOS DO PARCEIRO ===');
    console.log('Carregando dados do parceiro:', partnerProfile.id);
    
    // Get latest location
    const { data: location, error: locationError } = await supabase
      .from("user_locations")
      .select("*")
      .eq("user_id", partnerProfile.id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('Localização do parceiro:', location);
    console.log('Erro ao buscar localização:', locationError);

    const partnerData = {
      name: partnerProfile.name || partnerProfile.email || "Usuário",
      code: partnerCode,
      lastSeen: location ? "Agora" : "Nunca",
      status: location ? "online" : "offline",
      location: location ? {
        lat: parseFloat(location.latitude.toString()),
        lng: parseFloat(location.longitude.toString()),
        address: location.address || "Localização desconhecida"
      } : {
        lat: -23.5505,
        lng: -46.6333,
        address: "Localização não disponível"
      }
    };

    console.log('Definindo dados do parceiro:', partnerData);
    setPartnerData(partnerData);
    setIsTracking(true);
  };

  const handleStopTracking = async () => {
    if (!partnerData) return;

    try {
      console.log('=== PARANDO RASTREAMENTO ===');
      // Remove tracking relationship
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("tracking_code", partnerData.code)
        .single();

      if (partnerProfile) {
        await supabase
          .from("tracking_relationships")
          .delete()
          .eq("tracker_id", user?.id)
          .eq("tracked_id", partnerProfile.id);
      }

      setIsTracking(false);
      setPartnerData(null);
      
      toast({
        title: "Rastreamento parado",
        description: "Você não está mais rastreando nenhum parceiro",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível parar o rastreamento",
        variant: "destructive",
      });
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show auth page if not logged in
  if (!user) {
    return null;
  }

  // Show code display if requested
  if (showCodeDisplay) {
    return <CodeDisplay onBack={() => setShowCodeDisplay(false)} />;
  }

  if (isTracking && partnerData) {
    return (
      <TrackingView
        partnerData={partnerData}
        onStopTracking={handleStopTracking}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <WelcomeScreen
      userProfile={userProfile}
      userEmail={user.email || ''}
      onTrackPartner={handleTrackPartner}
      onShowCode={() => setShowCodeDisplay(true)}
      onSignOut={handleSignOut}
    />
  );
};

export default Index;
