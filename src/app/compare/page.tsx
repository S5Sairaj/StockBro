
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, GitCompareArrows } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getComparisonData } from '../actions';
import ComparisonTable from '@/components/comparison-table';

const formSchema = z.object({
  symbols: z.string()
    .min(1, 'Please enter at least one stock symbol.')
    .refine(value => value.split(',').every(s => s.trim().length > 0 && s.trim().length <= 5), {
        message: 'All symbols must be between 1 and 5 characters.'
    })
    .refine(value => value.split(',').length <= 4, {
        message: 'You can compare up to 4 symbols at a time.'
    }),
});

type ComparisonData = Awaited<ReturnType<typeof getComparisonData>>;

export default function ComparePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ComparisonData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbols: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setData(null);
    try {
      const symbols = values.symbols.split(',').map(s => s.trim().toUpperCase());
      const result = await getComparisonData(symbols);
      setData(result);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Stock Comparison Tool</h2>
            <p className="text-muted-foreground">Compare key financial metrics of up to four companies side-by-side.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Stock Symbols</CardTitle>
            <CardDescription>Enter comma-separated stock symbols (e.g., AAPL, GOOG, MSFT).</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name="symbols"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Symbols</FormLabel>
                      <FormControl>
                        <Input placeholder="AAPL, GOOG, MSFT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="h-10">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GitCompareArrows className="mr-2 h-4 w-4" />
                  )}
                  Compare
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {loading && (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Fetching comparison data...</p>
                </CardContent>
            </Card>
        )}

        {data && <ComparisonTable data={data} />}
      </div>
    </div>
  );
}
