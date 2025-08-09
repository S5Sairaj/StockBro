
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
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  analystRecommendation?: string;
}

function formatMarketCap(value: number) {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toString();
}

const StatCard = ({ label, value }: { label: string, value: string | number | undefined }) => {
    if (value === undefined || value === null || value === 'none') return null;
    return (
        <div className="flex flex-col space-y-1 rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-bold">{value}</p>
        </div>
    );
};

export default function StockDetails({ 
  symbol, name, exchange, description, analysis, profitProbability,
  marketCap, peRatio, dividendYield, analystRecommendation
}: StockDetailsProps) {
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
            <CardDescription>{exchange} - Data is delayed.</CardDescription>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Market Cap" value={marketCap ? formatMarketCap(marketCap) : 'N/A'} />
            <StatCard label="P/E Ratio" value={peRatio ? peRatio.toFixed(2) : 'N/A'} />
            <StatCard label="Dividend Yield" value={dividendYield ? `${(dividendYield * 100).toFixed(2)}%` : 'N/A'} />
            <StatCard label="Analyst Consensus" value={analystRecommendation ? analystRecommendation.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'N/A'} />
        </div>
        
        {description && (
            <>
                <Separator />
                <p className="text-sm text-muted-foreground">{description}</p>
            </>
        )}

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
