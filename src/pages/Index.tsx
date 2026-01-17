import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import StatsCards from '@/components/StatsCards';
import CommandsTab from '@/components/CommandsTab';
import UsersTab from '@/components/UsersTab';
import SettingsTab from '@/components/SettingsTab';
import StatsActivityTab from '@/components/StatsActivityTab';

interface User {
  id: number;
  username: string;
  status: 'active' | 'warned' | 'muted' | 'banned';
  violations: number;
}

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const API_URL = 'https://functions.poehali.dev/48dc2402-681e-464b-9465-d2c6845e6d1c';

const Index = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Всего участников', value: 0, icon: 'Users', color: 'text-primary' },
    { label: 'Баны сегодня', value: 0, icon: 'UserX', color: 'text-destructive' },
    { label: 'Муты сегодня', value: 0, icon: 'Volume2', color: 'text-orange-500' },
    { label: 'Предупреждения', value: 0, icon: 'AlertTriangle', color: 'text-yellow-500' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}?action=stats`),
        fetch(`${API_URL}?action=users`)
      ]);
      
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      
      setStats([
        { label: 'Всего участников', value: statsData.total_users, icon: 'Users', color: 'text-primary' },
        { label: 'Баны сегодня', value: statsData.bans_today, icon: 'UserX', color: 'text-destructive' },
        { label: 'Муты сегодня', value: statsData.mutes_today, icon: 'Volume2', color: 'text-orange-500' },
        { label: 'Предупреждения', value: statsData.warns_today, icon: 'AlertTriangle', color: 'text-yellow-500' },
      ]);
      
      setUsers(usersData.users.map((u: any) => ({
        id: u.id,
        username: u.username.startsWith('@') ? u.username : `@${u.username}`,
        status: u.status,
        violations: u.violations
      })));
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const [autoModSettings, setAutoModSettings] = useState({
    spamFilter: true,
    linkFilter: false,
    capsFilter: true,
    floodProtection: true,
  });

  const handleModAction = (action: string, username: string) => {
    toast({
      title: `${action} применён`,
      description: `Пользователь ${username} получил ${action.toLowerCase()}`,
    });
  };

  const getStatusBadge = (status: User['status']) => {
    const variants: Record<User['status'], { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Активен' },
      warned: { variant: 'secondary', label: 'Предупреждён' },
      muted: { variant: 'outline', label: 'Мут' },
      banned: { variant: 'destructive', label: 'Бан' },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-5xl">🐱</div>
            <h1 className="text-4xl font-bold text-primary">Барсик</h1>
          </div>
          <p className="text-muted-foreground">Модератор Telegram-группы</p>
          <p className="text-sm text-muted-foreground mt-1">Bot ID: 8554700760</p>
        </div>

        <StatsCards stats={stats} />

        <Tabs defaultValue="commands" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="commands">
              <Icon name="Terminal" size={16} className="mr-2" />
              Команды
            </TabsTrigger>
            <TabsTrigger value="users">
              <Icon name="Users" size={16} className="mr-2" />
              Участники
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commands" className="space-y-4">
            <CommandsTab handleModAction={handleModAction} />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UsersTab 
              users={users} 
              handleModAction={handleModAction}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab 
              autoModSettings={autoModSettings}
              setAutoModSettings={setAutoModSettings}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsActivityTab getStatusBadge={getStatusBadge} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
