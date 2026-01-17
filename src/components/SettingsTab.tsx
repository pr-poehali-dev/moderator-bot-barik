import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface AutoModSettings {
  spamFilter: boolean;
  linkFilter: boolean;
  capsFilter: boolean;
  floodProtection: boolean;
}

interface SettingsTabProps {
  autoModSettings: AutoModSettings;
  setAutoModSettings: (settings: AutoModSettings) => void;
}

const SettingsTab = ({ autoModSettings, setAutoModSettings }: SettingsTabProps) => {
  return (
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
  );
};

export default SettingsTab;
