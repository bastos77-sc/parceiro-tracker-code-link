
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Shield, Clock, Users, LogOut } from "lucide-react";
import PartnerTrackingForm from "./PartnerTrackingForm";

interface WelcomeScreenProps {
  userProfile: any;
  userEmail: string;
  onTrackPartner: (code: string) => void;
  onShowCode: () => void;
  onSignOut: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userProfile,
  userEmail,
  onTrackPartner,
  onShowCode,
  onSignOut
}) => {
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
              Bem-vindo, {userProfile?.name || userEmail}
            </p>
            <Button onClick={onSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <PartnerTrackingForm 
          onTrackPartner={onTrackPartner}
          onShowCode={onShowCode}
        />

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

export default WelcomeScreen;
