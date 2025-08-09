import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface StockDetailsProps {
  symbol: string;
  name: string;
  exchange: string;
  description?: string;
  analysis?: string;
  profitProbability?: number;
}

export default function StockDetails({ symbol, name, exchange, description, analysis, profitProbability }: StockDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{name} ({symbol})</CardTitle>
                <CardDescription>{exchange}</CardDescription>
            </div>
            {profitProbability !== undefined && (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span className="font-semibold">Profit Probability:</span>
                        <span className="font-bold text-accent">{(profitProbability * 100).toFixed(0)}%</span>
                    </Badge>
                </div>
            )}
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
