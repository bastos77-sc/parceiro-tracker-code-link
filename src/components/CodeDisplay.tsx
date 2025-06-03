
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Share2, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeDisplayProps {
  onBack: () => void;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ onBack }) => {
  const [userCode, setUserCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Gerar código único do usuário
    generateNewCode();
  }, []);

  const generateNewCode = () => {
    const prefix = 'PRT';
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const newCode = `${prefix}-${randomNumber}`;
    setUserCode(newCode);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu código TrackPartner',
          text: `Use este código para me rastrear no TrackPartner: ${userCode}`,
        });
      } catch (error) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const handleToggleStatus = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "Rastreamento desativado" : "Rastreamento ativado",
      description: isActive ? "Seu parceiro não poderá mais te rastrear" : "Seu parceiro já pode te rastrear novamente",
    });
  };

  const handleGenerateNewCode = () => {
    generateNewCode();
    toast({
      title: "Novo código gerado!",
      description: "Um novo código único foi criado para você",
    });
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seu Código</h1>
            <p className="text-gray-600">Compartilhe este código com seu parceiro</p>
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
                  {userCode}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleCopyCode}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
                
                <Button 
                  onClick={handleShareCode}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
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
                onClick={handleGenerateNewCode}
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
                  Envie este código para seu parceiro. Ele poderá inserir o código no app para começar a te rastrear.
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
