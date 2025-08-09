'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lightbulb } from 'lucide-react';

interface Indicator {
  name: string;
  description: string;
}

interface IndicatorRecommendationsProps {
  indicators: Indicator[];
}

export default function IndicatorRecommendations({ indicators }: IndicatorRecommendationsProps) {
  if (!indicators || indicators.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            <CardTitle>Indicator Recommendations</CardTitle>
        </div>
        <CardDescription>
          AI-powered suggestions for technical indicators to aid your analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Indicator</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicators.map((indicator, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{indicator.name}</TableCell>
                <TableCell className="text-muted-foreground">{indicator.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
