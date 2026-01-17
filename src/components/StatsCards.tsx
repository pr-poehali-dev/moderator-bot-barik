import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface StatsCardsProps {
  stats: Stat[];
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
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
  );
};

export default StatsCards;
