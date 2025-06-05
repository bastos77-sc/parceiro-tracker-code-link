
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
      console.log('=== DEBUGGING TRACKING PROCESS ===');
      console.log('1. Input partner code:', partnerCode.trim());
      console.log('2. Current user ID:', user?.id);
      
      // First, let's check if there are any profiles in the database
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("id, email, name, tracking_code, is_tracking_active");
      
      console.log('3. All profiles in database:', allProfiles);
      console.log('4. All profiles error:', allProfilesError);
      
      // Find the partner by tracking code
      const { data: partnerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("tracking_code", partnerCode.trim())
        .maybeSingle();

      console.log('5. Partner search result:', partnerProfile);
      console.log('6. Partner search error:', profileError);

      if (profileError) {
        console.error('Database error:', profileError);
        toast({
          title: "Erro na busca",
          description: "Erro ao buscar o código no banco de dados: " + profileError.message,
          variant: "destructive",
        });
        return;
      }

      if (!partnerProfile) {
        console.log('7. No partner found with code:', partnerCode.trim());
        toast({
          title: "Código não encontrado",
          description: `Código de rastreamento "${partnerCode.trim()}" não foi encontrado no sistema`,
          variant: "destructive",
        });
        return;
      }

      console.log('8. Partner found:', partnerProfile);

      if (!partnerProfile.is_tracking_active) {
        console.log('9. Partner tracking is inactive');
        toast({
          title: "Rastreamento inativo",
          description: "O usuário desativou o rastreamento",
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

      console.log('10. Existing relationship check:', existingRelationship);
      console.log('11. Relationship check error:', relationshipCheckError);

      if (existingRelationship) {
        console.log('12. Already tracking this user');
        toast({
          title: "Já rastreando",
          description: "Você já está rastreando este usuário",
          variant: "destructive",
        });
        setIsTracking(true);
        // Get existing partner data
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

      console.log('13. Create relationship error:', relationshipError);

      if (relationshipError) {
        console.error('Error creating relationship:', relationshipError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o relacionamento de rastreamento: " + relationshipError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('14. Relationship created successfully');
      await loadPartnerData(partnerProfile, partnerCode);
      
      toast({
        title: "Rastreamento iniciado!",
        description: `Agora você está rastreando ${partnerProfile.name || 'o usuário'}`,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o rastreamento: " + error.message,
        variant: "destructive",
      });
    }
  };

  const loadPartnerData = async (partnerProfile: any, partnerCode: string) => {
    console.log('Loading partner data for:', partnerProfile.id);
    
    // Get latest location
    const { data: location, error: locationError } = await supabase
      .from("user_locations")
      .select("*")
      .eq("user_id", partnerProfile.id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('Partner location:', location);
    console.log('Location error:', locationError);

    const mockPartnerData = {
      name: partnerProfile.name || "Usuário",
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

    console.log('Setting partner data:', mockPartnerData);
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
