import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="hover-scale transition-all duration-300 border-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon name={stat.icon as any} size={18} className={stat.color} />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-destructive">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-destructive/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon name="Ban" size={24} className="text-destructive" />
                    </div>
                    <div>
                      <CardTitle>Бан</CardTitle>
                      <CardDescription>/ban @username</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Удаляет пользователя из группы навсегда
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleModAction('Бан', '@example')}
                  >
                    <Icon name="Ban" size={16} className="mr-2" />
                    Применить бан
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon name="VolumeX" size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <CardTitle>Мут</CardTitle>
                      <CardDescription>/mute @username [время]</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Запрещает отправку сообщений на указанное время
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                    onClick={() => handleModAction('Мут', '@example')}
                  >
                    <Icon name="VolumeX" size={16} className="mr-2" />
                    Выдать мут
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-yellow-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon name="AlertTriangle" size={24} className="text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle>Предупреждение</CardTitle>
                      <CardDescription>/warn @username</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Выдаёт предупреждение пользователю (3 = автобан)
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                    onClick={() => handleModAction('Предупреждение', '@example')}
                  >
                    <Icon name="AlertTriangle" size={16} className="mr-2" />
                    Предупредить
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon name="Info" size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <CardTitle>Информация</CardTitle>
                      <CardDescription>/userinfo @username</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Показывает статистику и нарушения пользователя
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-blue-500 text-blue-500 hover:bg-blue-50"
                  >
                    <Icon name="Info" size={16} className="mr-2" />
                    Показать инфо
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon name="HelpCircle" size={24} className="text-green-500" />
                    </div>
                    <div>
                      <CardTitle>Помощь</CardTitle>
                      <CardDescription>/help</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Список всех доступных команд модератора
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-500 hover:bg-green-50"
                  >
                    <Icon name="HelpCircle" size={16} className="mr-2" />
                    Список команд
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon name="BarChart3" size={24} className="text-purple-500" />
                    </div>
                    <div>
                      <CardTitle>Статистика</CardTitle>
                      <CardDescription>/stats</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Детальная статистика модерации группы
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
                  >
                    <Icon name="BarChart3" size={16} className="mr-2" />
                    Показать статы
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Список участников группы</CardTitle>
                <CardDescription>Управление пользователями и модерация</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white font-bold">
                          {user.username[1].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Нарушений: {user.violations}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(user.status)}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModAction('Предупреждение', user.username)}
                          >
                            <Icon name="AlertTriangle" size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModAction('Мут', user.username)}
                          >
                            <Icon name="VolumeX" size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleModAction('Бан', user.username)}
                          >
                            <Icon name="Ban" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Автомодерация</CardTitle>
                <CardDescription>
                  Настройки автоматического удаления спама и запрещённого контента
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="spam-filter" className="text-base">
                      Фильтр спама
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Автоматическое удаление спам-сообщений
                    </p>
                  </div>
                  <Switch
                    id="spam-filter"
                    checked={autoModSettings.spamFilter}
                    onCheckedChange={(checked) =>
                      setAutoModSettings({ ...autoModSettings, spamFilter: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="link-filter" className="text-base">
                      Фильтр ссылок
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Блокировка подозрительных ссылок
                    </p>
                  </div>
                  <Switch
                    id="link-filter"
                    checked={autoModSettings.linkFilter}
                    onCheckedChange={(checked) =>
                      setAutoModSettings({ ...autoModSettings, linkFilter: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="caps-filter" className="text-base">
                      Фильтр капса
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Предупреждение за СООБЩЕНИЯ КАПСОМ
                    </p>
                  </div>
                  <Switch
                    id="caps-filter"
                    checked={autoModSettings.capsFilter}
                    onCheckedChange={(checked) =>
                      setAutoModSettings({ ...autoModSettings, capsFilter: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="flood-protection" className="text-base">
                      Защита от флуда
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ограничение частоты сообщений от одного пользователя
                    </p>
                  </div>
                  <Switch
                    id="flood-protection"
                    checked={autoModSettings.floodProtection}
                    onCheckedChange={(checked) =>
                      setAutoModSettings({ ...autoModSettings, floodProtection: checked })
                    }
                  />
                </div>

                <div className="pt-4 border-t">
                  <Label htmlFor="warn-limit" className="text-base mb-2 block">
                    Лимит предупреждений до автобана
                  </Label>
                  <Input id="warn-limit" type="number" defaultValue={3} className="max-w-xs" />
                </div>

                <Button className="w-full" size="lg">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Активность модерации</CardTitle>
                  <CardDescription>Последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { day: 'Понедельник', bans: 2, mutes: 5, warns: 8 },
                      { day: 'Вторник', bans: 1, mutes: 3, warns: 6 },
                      { day: 'Среда', bans: 4, mutes: 7, warns: 12 },
                      { day: 'Четверг', bans: 0, mutes: 2, warns: 4 },
                      { day: 'Пятница', bans: 3, mutes: 6, warns: 10 },
                      { day: 'Суббота', bans: 5, mutes: 9, warns: 15 },
                      { day: 'Воскресенье', bans: 3, mutes: 5, warns: 12 },
                    ].map((day) => (
                      <div key={day.day} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{day.day}</span>
                          <span className="text-muted-foreground">
                            Всего: {day.bans + day.mutes + day.warns}
                          </span>
                        </div>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-destructive"
                            style={{ width: `${(day.bans / 20) * 100}%` }}
                          />
                          <div
                            className="bg-orange-500"
                            style={{ width: `${(day.mutes / 20) * 100}%` }}
                          />
                          <div
                            className="bg-yellow-500"
                            style={{ width: `${(day.warns / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Топ нарушителей</CardTitle>
                  <CardDescription>Пользователи с наибольшим количеством нарушений</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { username: '@toxic_user', violations: 5, status: 'banned' },
                      { username: '@spam_bot_123', violations: 3, status: 'muted' },
                      { username: '@bad_actor', violations: 2, status: 'warned' },
                      { username: '@maria_sidorova', violations: 1, status: 'warned' },
                    ].map((user, index) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-destructive to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground">
                              Нарушений: {user.violations}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(user.status as User['status'])}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;