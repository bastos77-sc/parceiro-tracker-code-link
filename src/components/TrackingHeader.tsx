
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, LogOut } from "lucide-react";

interface TrackingHeaderProps {
  partnerName: string;
  partnerStatus: string;
  onStopTracking: () => void;
  onSignOut: () => void;
}

const TrackingHeader: React.FC<TrackingHeaderProps> = ({
  partnerName,
  partnerStatus,
  onStopTracking,
  onSignOut
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TrackPartner</h1>
              <p className="text-sm text-gray-500">Rastreando: {partnerName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={partnerStatus === 'online' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
              {partnerStatus === 'online' ? 'Online' : 'Offline'}
            </Badge>
            <Button onClick={onStopTracking} variant="outline">
              Parar Rastreamento
            </Button>
            <Button onClick={onSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TrackingHeader;
