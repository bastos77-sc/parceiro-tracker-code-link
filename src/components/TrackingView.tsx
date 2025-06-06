
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePartnerLocation } from "@/hooks/usePartnerLocation";
import TrackingMap from "./TrackingMap";
import LocationHistory from "./LocationHistory";
import NotificationPanel from "./NotificationPanel";
import TrackingHeader from "./TrackingHeader";

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
  const [realTimeLocation, setRealTimeLocation] = useState(partnerData.location);
  const { toast } = useToast();

  // Update location when partnerLocation changes
  useEffect(() => {
    if (partnerLocation) {
      const newLocation = {
        lat: partnerLocation.latitude,
        lng: partnerLocation.longitude,
        address: partnerLocation.address || "Localização atualizada"
      };
      setRealTimeLocation(newLocation);
      
      toast({
        title: "Localização atualizada",
        description: `${partnerLocation.name} está em: ${partnerLocation.address || 'Nova localização'}`,
      });
    }
  }, [partnerLocation, toast]);

  // Auto-refresh location every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleRefreshLocation = () => {
    refetch();
    toast({
      title: "Atualizando localização...",
      description: "Buscando a posição mais recente",
    });
  };

  const getLastSeenText = () => {
    if (partnerLocation) {
      const lastSeen = new Date(partnerLocation.timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);
      
      if (diffMinutes < 1) return "Agora mesmo";
      if (diffMinutes < 60) return `${diffMinutes} minutos atrás`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} horas atrás`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} dias atrás`;
    }
    return partnerData.lastSeen;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <TrackingHeader
        partnerName={partnerLocation?.name || partnerData.name}
        partnerStatus={partnerData.status}
        onStopTracking={onStopTracking}
        onSignOut={onSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Localização em Tempo Real</span>
                  </div>
                  <Button 
                    onClick={handleRefreshLocation}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
                <CardDescription>
                  Última atualização: {getLastSeenText()}
                  {error && (
                    <span className="text-red-500 block mt-1">
                      Erro ao carregar localização: {error}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <TrackingMap location={realTimeLocation} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status do Parceiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nome:</span>
                    <span className="font-medium">{partnerLocation?.name || partnerData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      partnerData.status === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {partnerData.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Última localização:</span>
                    <span className="text-sm">{getLastSeenText()}</span>
                  </div>
                  {partnerLocation && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-gray-600">Endereço:</span>
                      <p className="text-sm mt-1">{partnerLocation.address || 'Endereço não disponível'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                <NotificationPanel partnerName={partnerLocation?.name || partnerData.name} />
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
