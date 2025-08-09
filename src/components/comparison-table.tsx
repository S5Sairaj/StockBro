
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getComparisonData } from '@/app/actions';
import { Badge } from './ui/badge';
import Link from 'next/link';

type ComparisonData = Awaited<ReturnType<typeof getComparisonData>>;

interface ComparisonTableProps {
  data: ComparisonData;
}

function formatMarketCap(value: number | string) {
  if (typeof value !== 'number') return value;
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toString();
}

function formatValue(value: any) {
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    if (typeof value === 'string' && value.includes('_')) {
        return value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return value || 'N/A';
}

export default function ComparisonTable({ data }: ComparisonTableProps) {
  const metrics = [
    { key: 'price', label: 'Current Price' },
    { key: 'marketCap', label: 'Market Cap', formatter: formatMarketCap },
    { key: 'peRatio', label: 'P/E Ratio' },
    { key: 'dividendYield', label: 'Dividend Yield', formatter: (val: any) => typeof val === 'number' ? `${(val * 100).toFixed(2)}%` : val },
    { key: 'analystRecommendation', label: 'Analyst Consensus' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold w-[200px]">Metric</TableHead>
              {data.map(stock => (
                <TableHead key={stock.symbol} className="text-center font-bold">
                    <Link href={`/?symbol=${stock.symbol}`} className="hover:underline">
                        {stock.name || stock.symbol}
                    </Link>
                    <p className="text-xs font-normal text-muted-foreground">{stock.symbol}</p>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map(metric => (
              <TableRow key={metric.key}>
                <TableCell className="font-medium">{metric.label}</TableCell>
                {data.map(stock => (
                  <TableCell key={`${stock.symbol}-${metric.key}`} className="text-center">
                    {metric.formatter 
                        ? metric.formatter((stock as any)[metric.key]) 
                        : formatValue((stock as any)[metric.key])
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
