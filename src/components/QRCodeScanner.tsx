
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  onCodeScanned: (code: string) => void;
  onBack: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onCodeScanned, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Use a opção de upload de imagem.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      processQRCodeFromImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  const processQRCodeFromImage = (imageSrc: string) => {
    // In a real implementation, you would use a QR code detection library
    // For now, we'll show a message asking user to enter code manually
    toast({
      title: "QR Code detectado",
      description: "Por favor, digite o código manualmente na tela anterior",
    });
    onBack();
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // In a real implementation, you would process the canvas data
      // to detect and decode QR codes using a library like jsQR
      toast({
        title: "Frame capturado",
        description: "Processando QR code... Por favor, digite o código manualmente se não funcionar",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="mb-6">
          <Button 
            onClick={() => {
              stopCamera();
              onBack();
            }}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Scanner QR</h1>
            <p className="text-gray-600">Escaneie um código QR do TrackPartner</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Escaneamento de QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isScanning ? (
              <div className="text-center space-y-4">
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Câmera não iniciada</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={startCamera}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Iniciar Câmera
                  </Button>
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload de Imagem
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-lg bg-black"
                  />
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                    <div className="absolute inset-4 border border-blue-300 rounded"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={captureFrame}
                    className="w-full"
                  >
                    Capturar QR Code
                  </Button>
                  
                  <Button 
                    onClick={stopCamera}
                    variant="outline"
                    className="w-full"
                  >
                    Parar Câmera
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-medium text-yellow-900 mb-2">Nota</h3>
              <p className="text-sm text-yellow-700">
                Esta é uma versão simplificada do scanner. Para melhor funcionalidade, 
                recomendamos digitar o código manualmente na tela anterior.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default QRCodeScanner;
