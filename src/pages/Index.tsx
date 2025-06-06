import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CodeDisplay from "@/components/CodeDisplay";
import CodeValidator from "@/components/CodeValidator";
import WelcomeScreen from "@/components/WelcomeScreen";
import TrackingView from "@/components/TrackingView";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [showCodeDisplay, setShowCodeDisplay] = useState(false);
  const [showCodeValidator, setShowCodeValidator] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile for:', user?.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      console.log('User profile fetched:', data);
      setUserProfile(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSignOut = async () => {
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
    if (!partnerCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, insira o código único do seu parceiro",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('=== INICIANDO RASTREAMENTO ===');
      console.log('Código do parceiro:', partnerCode.trim());
      console.log('ID do usuário atual:', user?.id);
      
      // Check if user is trying to track themselves
      if (userProfile?.tracking_code === partnerCode.trim()) {
        toast({
          title: "Código inválido",
          description: "Você não pode rastrear a si mesmo",
          variant: "destructive",
        });
        return;
      }
      
      // Find the partner by tracking code
      const { data: partnerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("tracking_code", partnerCode.trim())
        .maybeSingle();

      console.log('Resultado da busca do parceiro:', partnerProfile);
      console.log('Erro na busca:', profileError);

      if (profileError) {
        console.error('Erro no banco de dados:', profileError);
        toast({
          title: "Erro na busca",
          description: "Erro ao buscar o código no banco de dados",
          variant: "destructive",
        });
        return;
      }

      if (!partnerProfile) {
        // Enhanced error message with suggestion to use validator
        toast({
          title: "Código não encontrado",
          description: `O código "${partnerCode.trim()}" não existe. Use o "Validar Código" para verificar códigos disponíveis.`,
          variant: "destructive",
        });
        return;
      }

      console.log('Parceiro encontrado:', partnerProfile);

      if (!partnerProfile.is_tracking_active) {
        toast({
          title: "Rastreamento inativo",
          description: "Este usuário desativou o rastreamento",
          variant: "destructive",
        });
        return;
      }

      // Check if already tracking this user
      const { data: existingRelationship, error: relationshipCheckError } = await supabase
        .from("tracking_relationships")
        .select("id")
        .eq("tracker_id", user?.id)
        .eq("tracked_id", partnerProfile.id)
        .maybeSingle();

      console.log('Relacionamento existente:', existingRelationship);

      if (existingRelationship) {
        toast({
          title: "Já rastreando",
          description: "Você já está rastreando este usuário",
          variant: "destructive",
        });
        setIsTracking(true);
        await loadPartnerData(partnerProfile, partnerCode);
        return;
      }

      // Create tracking relationship
      const { error: relationshipError } = await supabase
        .from("tracking_relationships")
        .insert({
          tracker_id: user?.id,
          tracked_id: partnerProfile.id
        });

      if (relationshipError) {
        console.error('Erro ao criar relacionamento:', relationshipError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o relacionamento de rastreamento",
          variant: "destructive",
        });
        return;
      }

      console.log('Relacionamento criado com sucesso');
      await loadPartnerData(partnerProfile, partnerCode);
      
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

    const mockPartnerData = {
      name: partnerProfile.name || partnerProfile.email || "Usuário",
      code: partnerCode,
      lastSeen: location ? "Agora" : "Nunca",
      status: "online",
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

    console.log('Definindo dados do parceiro:', mockPartnerData);
    setPartnerData(mockPartnerData);
    setIsTracking(true);
  };

  const handleStopTracking = async () => {
    if (!partnerData) return;

    try {
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

  // Show code validator if requested
  if (showCodeValidator) {
    return <CodeValidator onBack={() => setShowCodeValidator(false)} />;
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
      onShowValidator={() => setShowCodeValidator(true)}
      onSignOut={handleSignOut}
    />
  );
};

export default Index;
