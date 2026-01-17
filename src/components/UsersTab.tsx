import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  status: 'active' | 'warned' | 'muted' | 'banned';
  violations: number;
}

interface UsersTabProps {
  users: User[];
  handleModAction: (action: string, username: string) => void;
  getStatusBadge: (status: User['status']) => JSX.Element;
}

const UsersTab = ({ users, handleModAction, getStatusBadge }: UsersTabProps) => {
  return (
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
  );
};

export default UsersTab;
