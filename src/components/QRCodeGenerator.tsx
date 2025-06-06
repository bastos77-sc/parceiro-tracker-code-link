
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  trackingCode: string;
  userName: string;
  onBack: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  trackingCode, 
  userName, 
  onBack 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [trackingCode]);

  const generateQRCode = async () => {
    try {
      const qrData = {
        type: 'trackpartner',
        code: trackingCode,
        name: userName
      };
      
      const qrString = JSON.stringify(qrData);
      const url = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o código QR",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `trackpartner-qr-${trackingCode}.png`;
    link.href = qrCodeUrl;
    link.click();
    
    toast({
      title: "QR Code baixado!",
      description: "O código QR foi salvo em seu dispositivo",
    });
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `trackpartner-qr-${trackingCode}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Meu código TrackPartner',
          text: `Escaneie este QR code para me rastrear no TrackPartner`,
          files: [file]
        });
      } else {
        // Fallback to download
        downloadQRCode();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      downloadQRCode(); // Fallback to download
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="mb-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Código QR</h1>
            <p className="text-gray-600">Compartilhe este QR code para ser rastreado</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Seu QR Code de Rastreamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {qrCodeUrl ? (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code do TrackPartner" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gerando QR Code...</p>
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Código: {trackingCode}</p>
              <p className="text-sm text-gray-600">Nome: {userName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={downloadQRCode}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={!qrCodeUrl}
              >
                <Download className="w-4 h-4" />
                <span>Baixar</span>
              </Button>
              
              <Button 
                onClick={shareQRCode}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={!qrCodeUrl}
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-medium text-blue-900 mb-2">Como usar</h3>
              <p className="text-sm text-blue-700">
                Seu parceiro pode escanear este QR code com qualquer app de câmera ou QR scanner. 
                O código será automaticamente copiado e ele poderá colar no TrackPartner para te rastrear.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
