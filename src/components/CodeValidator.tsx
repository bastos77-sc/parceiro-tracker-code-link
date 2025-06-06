
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, User, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CodeValidatorProps {
  onBack: () => void;
}

const CodeValidator: React.FC<CodeValidatorProps> = ({ onBack }) => {
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();

  const validateCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, insira um código para verificar",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setValidationResult(null);

    try {
      console.log('Validando código:', code.trim());
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("tracking_code", code.trim())
        .maybeSingle();

      console.log('Resultado da validação:', profile, error);

      if (error) {
        console.error('Erro na validação:', error);
        toast({
          title: "Erro na verificação",
          description: "Erro ao verificar o código no banco de dados",
          variant: "destructive",
        });
        return;
      }

      if (profile) {
        setValidationResult({
          valid: true,
          profile: profile
        });
        toast({
          title: "Código válido!",
          description: `Código encontrado para ${profile.name || profile.email}`,
        });
      } else {
        setValidationResult({
          valid: false,
          message: "Código não encontrado na base de dados"
        });
        toast({
          title: "Código não encontrado",
          description: "Este código não existe na nossa base de dados",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao verificar o código",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mb-4"
          >
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Validador de Códigos</h1>
          <p className="text-gray-600">Verifique se um código de rastreamento é válido</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verificar Código</CardTitle>
            <CardDescription>
              Insira o código para verificar se é válido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Código de Rastreamento
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: PRT-217994"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>

            <Button 
              onClick={validateCode}
              disabled={isChecking}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              {isChecking ? "Verificando..." : "Verificar Código"}
            </Button>

            {validationResult && (
              <div className="mt-6">
                {validationResult.valid ? (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">Código Válido</h3>
                          <p className="text-sm text-green-600">Este código existe na base de dados</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {validationResult.profile.name || validationResult.profile.email}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <Badge variant={validationResult.profile.is_tracking_active ? "default" : "secondary"}>
                            {validationResult.profile.is_tracking_active ? "Rastreamento Ativo" : "Rastreamento Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <div>
                          <h3 className="font-semibold text-red-800">Código Inválido</h3>
                          <p className="text-sm text-red-600">{validationResult.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Códigos de Teste Disponíveis</h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>• PRT-702243 (usuário ativo)</p>
              <p>• Para testar com o código PRT-217994, verifique se esse usuário existe</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeValidator;
