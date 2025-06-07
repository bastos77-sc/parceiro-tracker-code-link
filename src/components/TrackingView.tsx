
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Bell, Satellite } from "lucide-react";
import { usePartnerLocation } from "@/hooks/usePartnerLocation";
import TrackingMap from "./TrackingMap";
import LocationHistory from "./LocationHistory";
import NotificationPanel from "./NotificationPanel";
import TrackingHeader from "./TrackingHeader";
import LocationTracker from "./LocationTracker";

interface TrackingViewProps {
  partnerData: any;
  onStopTracking: () => void;
  onSignOut: () => void;
}

const TrackingView: React.FC<TrackingViewProps> = ({
  partnerData,
  onStopTracking,
  onSignOut
}) => {
  const { partnerLocation, loading, error, refetch } = usePartnerLocation();

  // Atualizar dados do parceiro quando a localização mudar
  useEffect(() => {
    if (partnerLocation) {
      console.log('Localização do parceiro atualizada:', partnerLocation);
    }
  }, [partnerLocation]);

  // Calcular tempo desde última atualização
  const getLastSeenText = (timestamp: string) => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Agora";
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  // Usar dados reais se disponíveis, senão usar dados mockados
  const displayData = partnerLocation ? {
    name: partnerLocation.name,
    status: "online",
    lastSeen: getLastSeenText(partnerLocation.timestamp),
    location: {
      lat: partnerLocation.latitude,
      lng: partnerLocation.longitude,
      address: partnerLocation.address || "Endereço não disponível"
    }
  } : partnerData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <TrackingHeader
        partnerName={displayData.name}
        partnerStatus={displayData.status}
        onStopTracking={onStopTracking}
        onSignOut={onSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status de carregamento */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-blue-700">Atualizando localização do parceiro...</span>
            </div>
          </div>
        )}

        {/* Status de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-red-500" />
              <span className="text-red-700">{error}</span>
              <button 
                onClick={refetch}
                className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Mapa */}
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Localização em Tempo Real</span>
                  {partnerLocation && (
                    <span className="text-sm text-green-600 font-normal">
                      • Dados reais
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Última atualização: {displayData.lastSeen}
                  {partnerLocation && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({new Date(partnerLocation.timestamp).toLocaleString('pt-BR')})
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <TrackingMap location={displayData.location} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Controle de rastreamento próprio */}
            <LocationTracker />

            {/* Abas de notificações e histórico */}
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
                <NotificationPanel partnerName={displayData.name} />
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
};

export default TrackingView;
