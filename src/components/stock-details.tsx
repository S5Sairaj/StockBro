import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface StockDetailsProps {
  symbol: string;
  name: string;
  exchange: string;
  description?: string;
  analysis?: string;
  isExpert: boolean;
}

export default function StockDetails({ symbol, name, exchange, description, analysis, isExpert }: StockDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{name} ({symbol})</CardTitle>
                <CardDescription>{exchange}</CardDescription>
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
                        {isExpert && (
                            <Badge variant="outline" className="text-xs border-trophy text-trophy">
                                <Star className="h-3 w-3 mr-1"/>
                                Expert
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis}</p>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
