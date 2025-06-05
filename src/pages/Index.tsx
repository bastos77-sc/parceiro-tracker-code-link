
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Bell, Shield, Users, Search, QrCode, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TrackingMap from "@/components/TrackingMap";
import LocationHistory from "@/components/LocationHistory";
import NotificationPanel from "@/components/NotificationPanel";
import CodeDisplay from "@/components/CodeDisplay";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [partnerCode, setPartnerCode] = useState("");
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

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

  const handleTrackPartner = async () => {
    if (!partnerCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, insira o código único do seu parceiro",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Searching for partner with code:', partnerCode.trim());
      
      // Find the partner by tracking code
      const { data: partnerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("tracking_code", partnerCode.trim())
        .maybeSingle();

      console.log('Partner search result:', partnerProfile, profileError);

      if (profileError) {
        console.error('Database error:', profileError);
        toast({
          title: "Erro na busca",
          description: "Erro ao buscar o código no banco de dados",
          variant: "destructive",
        });
        return;
      }

      if (!partnerProfile) {
        toast({
          title: "Código não encontrado",
          description: "Código de rastreamento inválido ou inexistente",
          variant: "destructive",
        });
        return;
      }

      if (!partnerProfile.is_tracking_active) {
        toast({
          title: "Rastreamento inativo",
          description: "O usuário desativou o rastreamento",
          variant: "destructive",
        });
        return;
      }

      // Check if already tracking this user
      const { data: existingRelationship } = await supabase
        .from("tracking_relationships")
        .select("id")
        .eq("tracker_id", user?.id)
        .eq("tracked_id", partnerProfile.id)
        .maybeSingle();

      if (existingRelationship) {
        toast({
          title: "Já rastreando",
          description: "Você já está rastreando este usuário",
          variant: "destructive",
        });
        setIsTracking(true);
        // Get existing partner data
        await loadPartnerData(partnerProfile);
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
        console.error('Error creating relationship:', relationshipError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o relacionamento de rastreamento",
          variant: "destructive",
        });
        return;
      }

      await loadPartnerData(partnerProfile);
      
      toast({
        title: "Rastreamento iniciado!",
        description: `Agora você está rastreando ${partnerProfile.name || 'o usuário'}`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o rastreamento",
        variant: "destructive",
      });
    }
  };

  const loadPartnerData = async (partnerProfile: any) => {
    // Get latest location
    const { data: location } = await supabase
      .from("user_locations")
      .select("*")
      .eq("user_id", partnerProfile.id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

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
      setPartnerCode("");
      
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">TrackPartner</h1>
                  <p className="text-sm text-gray-500">Rastreando: {partnerData.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={partnerData.status === 'online' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                  {partnerData.status === 'online' ? 'Online' : 'Offline'}
                </Badge>
                <Button onClick={handleStopTracking} variant="outline">
                  Parar Rastreamento
                </Button>
                <Button onClick={handleSignOut} variant="ghost" size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Localização em Tempo Real</span>
                  </CardTitle>
                  <CardDescription>
                    Última atualização: {partnerData.lastSeen}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <TrackingMap location={partnerData.location} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notifications" className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>Notificações</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Histórico</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="notifications" className="mt-6">
                  <NotificationPanel partnerName={partnerData.name} />
                </TabsContent>
                
                <TabsContent value="history" className="mt-6">
                  <LocationHistory />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TrackPartner</h1>
          <p className="text-lg text-gray-600">Rastreie seu parceiro com segurança</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Bem-vindo, {userProfile?.name || user?.email}
            </p>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Rastreamento</CardTitle>
            <CardDescription>
              Insira o código único do seu parceiro para começar a rastrear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="partner-code" className="text-sm font-medium text-gray-700">
                Código do Parceiro
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="partner-code"
                  type="text"
                  placeholder="Ex: PRT-123456"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>

            <Button 
              onClick={handleTrackPartner}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Começar Rastreamento
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>

            <Button 
              onClick={() => setShowCodeDisplay(true)}
              variant="outline"
              className="w-full h-12 text-lg"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Ver Meu Código
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Card className="text-center p-4 bg-white/60 backdrop-blur-sm border-0">
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Seguro</p>
            <p className="text-xs text-gray-500">Dados criptografados</p>
          </Card>
          
          <Card className="text-center p-4 bg-white/60 backdrop-blur-sm border-0">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Tempo Real</p>
            <p className="text-xs text-gray-500">Atualizações instantâneas</p>
          </Card>
          
          <Card className="text-center p-4 bg-white/60 backdrop-blur-sm border-0">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Privado</p>
            <p className="text-xs text-gray-500">Apenas você vê</p>
          </Card>
        </div>

        {userProfile && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Seu código: <span className="font-mono font-bold">{userProfile.tracking_code}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
