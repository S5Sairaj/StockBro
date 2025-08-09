
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useWatchlist } from '@/hooks/use-watchlist';
import { TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockDetailsProps {
  symbol: string;
  name: string;
  exchange: string;
  description?: string;
  analysis?: string;
  profitProbability?: number;
}

export default function StockDetails({ symbol, name, exchange, description, analysis, profitProbability }: StockDetailsProps) {
  const { user } = useAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const isInWatchlist = watchlist.includes(symbol);

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name} ({symbol})</CardTitle>
            <CardDescription>{exchange}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {profitProbability !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3">
                <TrendingUp className="h-4 w-4 text-accent-foreground" />
                <span className="font-semibold">Profit Probability:</span>
                <span className="font-bold text-accent-foreground">{(profitProbability * 100).toFixed(0)}%</span>
              </Badge>
            )}
            {user && (
              <Button
                variant={isInWatchlist ? "secondary" : "outline"}
                size="icon"
                onClick={handleWatchlistToggle}
                aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                <Star className={cn("h-4 w-4", isInWatchlist && "fill-current text-yellow-500")} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {analysis && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-md font-semibold">AI Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground">{analysis}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
