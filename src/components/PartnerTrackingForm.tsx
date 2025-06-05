
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, QrCode } from "lucide-react";

interface PartnerTrackingFormProps {
  onTrackPartner: (code: string) => void;
  onShowCode: () => void;
}

const PartnerTrackingForm: React.FC<PartnerTrackingFormProps> = ({
  onTrackPartner,
  onShowCode
}) => {
  const [partnerCode, setPartnerCode] = useState("");

  const handleSubmit = () => {
    onTrackPartner(partnerCode);
  };

  return (
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
          onClick={handleSubmit}
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
          onClick={onShowCode}
          variant="outline"
          className="w-full h-12 text-lg"
        >
          <QrCode className="w-5 h-5 mr-2" />
          Ver Meu Código
        </Button>
      </CardContent>
    </Card>
  );
};

export default PartnerTrackingForm;
