'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Search } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  symbol: z.string().min(1, 'Required').max(5, 'Max 5 chars').toUpperCase(),
});

interface StockFormProps {
  onSearch: (symbol: string, timeframe: string) => void;
  loading: boolean;
}

export default function StockForm({ onSearch, loading }: StockFormProps) {
  const [timeframe, setTimeframe] = useState('daily');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSearch(values.symbol, timeframe);
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle>Analysis Options</CardTitle>
        <CardDescription>Enter a stock symbol and select a timeframe.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., AAPL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormItem>
            <FormLabel>Analysis Timeframe</FormLabel>
            <ToggleGroup
              type="single"
              value={timeframe}
              onValueChange={(value) => { if (value) setTimeframe(value); }}
              className="w-full justify-start"
              disabled={loading}
            >
              <ToggleGroupItem value="daily" aria-label="Daily">Daily</ToggleGroupItem>
              <ToggleGroupItem value="weekly" aria-label="Weekly">Weekly</ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Monthly">Monthly</ToggleGroupItem>
            </ToggleGroup>
          </FormItem>
          
          <Button type="submit" className="w-full" disabled={loading} variant="destructive">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Stock
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
