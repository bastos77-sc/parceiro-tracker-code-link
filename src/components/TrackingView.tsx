
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Bell } from "lucide-react";
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <TrackingHeader
        partnerName={partnerData.name}
        partnerStatus={partnerData.status}
        onStopTracking={onStopTracking}
        onSignOut={onSignOut}
      />

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
};

export default TrackingView;
