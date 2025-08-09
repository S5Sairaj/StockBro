
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
    quantity: z.coerce.number().min(0.000001, 'Quantity must be positive.'),
    purchasePrice: z.coerce.number().min(0.01, 'Price must be positive.'),
});

interface AddToPortfolioProps {
    symbol: string;
}

export default function AddToPortfolio({ symbol }: AddToPortfolioProps) {
    const { addToPortfolio } = usePortfolio();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: undefined,
            purchasePrice: undefined,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        addToPortfolio({
            symbol,
            ...values,
        });
        form.reset();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add to Portfolio</CardTitle>
                <CardDescription>Add or update your holdings for {symbol}.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="any" placeholder="e.g., 10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="purchasePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purchase Price ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="any" placeholder="e.g., 150.25" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add to Portfolio
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
