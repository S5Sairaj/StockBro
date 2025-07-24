import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface StockDetailsProps {
  symbol: string;
  name: string;
  exchange: string;
  description?: string;
  analysis?: string;
}

export default function StockDetails({ symbol, name, exchange, description, analysis }: StockDetailsProps) {
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
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis}</p>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
