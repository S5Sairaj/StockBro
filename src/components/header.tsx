import { CandlestickChart, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface HeaderProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export default function Header({ level, xp, xpToNextLevel }: HeaderProps) {
  const progressPercentage = (xp / xpToNextLevel) * 100;

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
      <div className="flex items-center gap-2">
        <CandlestickChart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">MarketGazer</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-trophy" />
          <span className="font-bold text-lg">Level {level}</span>
        </div>
        <div className="w-32">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-1">
            {xp} / {xpToNextLevel} XP
          </p>
        </div>
      </div>
    </header>
  );
}
