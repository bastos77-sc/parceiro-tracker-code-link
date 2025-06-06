
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Lock, AlertTriangle, CheckCircle } from "lucide-react";

const SecurityInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Configurações de Segurança</span>
          </CardTitle>
          <CardDescription className="text-orange-600">
            Algumas configurações de segurança precisam de atenção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800">Auth OTP Long Expiry</p>
                <p className="text-sm text-orange-600">Validade de OTP excede o limite recomendado</p>
              </div>
            </div>
            <Badge variant="destructive">Atenção</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800">Leaked Password Protection</p>
                <p className="text-sm text-orange-600">Proteção contra senhas vazadas está desabilitada</p>
              </div>
            </div>
            <Badge variant="destructive">Desabilitado</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>Configurações Seguras Ativas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Row Level Security (RLS)</p>
                <p className="text-sm text-green-600">Controle de acesso aos dados habilitado</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Autenticação Email/Password</p>
                <p className="text-sm text-green-600">Sistema de autenticação seguro</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Shield className="w-5 h-5" />
            <span>Recomendações de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-700">
            <p>• Configure o tempo de expiração do OTP para no máximo 15 minutos</p>
            <p>• Habilite a proteção contra senhas vazadas no Supabase</p>
            <p>• Configure políticas de senha mais rígidas</p>
            <p>• Implemente autenticação de dois fatores (2FA)</p>
            <p>• Monitore tentativas de login suspeitas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityInfo;
