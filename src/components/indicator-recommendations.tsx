'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
            <Lightbulb className="h-6 w-6 text-primary" />
            <CardTitle>Indicator Recommendations</CardTitle>
        </div>
        <CardDescription>
          AI-powered suggestions for technical indicators to aid your analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {indicators.map((indicator, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">{indicator.name}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {indicator.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
