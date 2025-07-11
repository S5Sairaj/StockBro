'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface TrendingStocksProps {
  stocks: Stock[];
  isLoading: boolean;
  onStockClick: (symbol: string) => void;
}

export default function TrendingStocks({ stocks, isLoading, onStockClick }: TrendingStocksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Stocks</CardTitle>
        <CardDescription>Market leaders and top movers.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                    <div className='flex-1 pr-4'>
                        <Skeleton className="h-5 w-20 mb-1" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className='w-24 text-right'>
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border -mx-6">
            {stocks.map((stock) => (
              <li 
                key={stock.symbol} 
                className="flex items-center justify-between p-4 px-6 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onStockClick(stock.symbol)}
              >
                <div className="flex-1 pr-4">
                  <p className="font-bold">{stock.symbol}</p>
                  <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  <div
                    className={cn(
                      'text-sm flex items-center justify-end gap-1',
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
