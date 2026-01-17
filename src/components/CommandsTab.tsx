import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CommandsTabProps {
  handleModAction: (action: string, username: string) => void;
}

const CommandsTab = ({ handleModAction }: CommandsTabProps) => {
  return (
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
  );
};

export default CommandsTab;
