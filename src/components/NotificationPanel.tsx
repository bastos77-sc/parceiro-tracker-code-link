
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface NotificationPanelProps {
  partnerName: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ partnerName }) => {
  const notifications = [
    {
      id: 1,
      type: 'arrival',
      message: `${partnerName} chegou no trabalho`,
      time: '2 min atrás',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 2,
      type: 'location',
      message: 'Nova localização detectada',
      time: '15 min atrás',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 3,
      type: 'battery',
      message: 'Bateria baixa (15%)',
      time: '1h atrás',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 4,
      type: 'departure',
      message: `${partnerName} saiu de casa`,
      time: '2h atrás',
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notificações</h3>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {notifications.length} novas
        </Badge>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <Card key={notification.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.bgColor}`}>
                    <IconComponent className={`w-5 h-5 ${notification.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{notification.time}</span>
                    </div>
                  </div>
                  
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Marcar todas como lidas
        </button>
      </div>

      {/* Configurações de notificação */}
      <Card className="mt-6 border-dashed border-2 border-gray-200">
        <CardContent className="p-4 text-center">
          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium text-gray-700 mb-1">Configurar Alertas</h4>
          <p className="text-sm text-gray-500 mb-3">
            Defina quando receber notificações
          </p>
          <button className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
            Personalizar
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPanel;
