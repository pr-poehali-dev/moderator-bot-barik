import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  username: string;
  status: 'active' | 'warned' | 'muted' | 'banned';
  violations: number;
}

interface StatsActivityTabProps {
  getStatusBadge: (status: User['status']) => JSX.Element;
}

const StatsActivityTab = ({ getStatusBadge }: StatsActivityTabProps) => {
  return (
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
  );
};

export default StatsActivityTab;
