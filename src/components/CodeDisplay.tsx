import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Share2, RefreshCw, ArrowLeft, CheckCircle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import QRCodeGenerator from './QRCodeGenerator';

interface CodeDisplayProps {
  onBack: () => void;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();

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
      setIsActive(data.is_tracking_active);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const generateNewCode = async () => {
    const prefix = 'PRT';
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const newCode = `${prefix}-${randomNumber}`;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ tracking_code: newCode })
        .eq("id", user?.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível gerar novo código",
          variant: "destructive",
        });
        return;
      }

      await fetchUserProfile();
      toast({
        title: "Novo código gerado!",
        description: "Um novo código único foi criado para você",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCopyCode = async () => {
    if (!userProfile?.tracking_code) return;
    
    try {
      await navigator.clipboard.writeText(userProfile.tracking_code);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para a área de transferência",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código",
        variant: "destructive",
      });
    }
  };

  const handleShareCode = async () => {
    if (!userProfile?.tracking_code) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu código TrackPartner',
          text: `Use este código para me rastrear no TrackPartner: ${userProfile.tracking_code}`,
        });
      } catch (error) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const handleToggleStatus = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_tracking_active: !isActive })
        .eq("id", user?.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível alterar o status",
          variant: "destructive",
        });
        return;
      }

      setIsActive(!isActive);
      toast({
        title: isActive ? "Rastreamento desativado" : "Rastreamento ativado",
        description: isActive ? "Seu parceiro não poderá mais te rastrear" : "Seu parceiro já pode te rastrear novamente",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      // Will be redirected by the auth context
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show QR code generator if requested
  if (showQRCode) {
    return (
      <QRCodeGenerator
        trackingCode={userProfile.tracking_code}
        userName={userProfile.name || user?.email || 'Usuário'}
        onBack={() => setShowQRCode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={onBack}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seu Código</h1>
            <p className="text-gray-600">Compartilhe este código com seu parceiro</p>
            <p className="text-sm text-gray-500 mt-2">
              Olá, {userProfile.name || user?.email}
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Código Único</CardTitle>
            <div className="flex justify-center">
              <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200 mb-4">
                <div className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
                  {userProfile.tracking_code}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button 
                  onClick={handleCopyCode}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
                
                <Button 
                  onClick={() => setShowQRCode(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <QrCode className="w-3 h-3" />
                  <span className="text-xs">QR Code</span>
                </Button>
                
                <Button 
                  onClick={handleShareCode}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span className="text-xs">Compartilhar</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleToggleStatus}
                variant={isActive ? "destructive" : "default"}
                className="w-full"
              >
                {isActive ? 'Desativar Rastreamento' : 'Ativar Rastreamento'}
              </Button>
              
              <Button 
                onClick={generateNewCode}
                variant="outline"
                className="w-full flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Gerar Novo Código</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <QrCode className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Como usar</h3>
                <p className="text-sm text-blue-700">
                  Envie este código para seu parceiro ou gere um QR code para facilitar o compartilhamento. 
                  Ele poderá inserir o código no app para começar a te rastrear.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeDisplay;
