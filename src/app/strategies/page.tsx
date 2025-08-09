
'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { useStrategies, Strategy } from '@/hooks/use-strategies';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, BookText } from 'lucide-react';

const strategySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

export default function StrategiesPage() {
  const { user } = useRequireAuth();
  const { strategies, addStrategy, updateStrategy, removeStrategy, isLoaded } = useStrategies();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);

  const form = useForm<z.infer<typeof strategySchema>>({
    resolver: zodResolver(strategySchema),
    defaultValues: { title: '', description: '' },
  });

  const handleOpenDialog = (strategy: Strategy | null = null) => {
    setEditingStrategy(strategy);
    if (strategy) {
      form.reset({
        id: strategy.id,
        title: strategy.title,
        description: strategy.description,
      });
    } else {
      form.reset({ title: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof strategySchema>) => {
    if (editingStrategy) {
      updateStrategy({ ...editingStrategy, ...values });
    } else {
      addStrategy(values);
    }
    setIsDialogOpen(false);
    setEditingStrategy(null);
  };

  if (!user || !isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Strategies</h2>
                <p className="text-muted-foreground">Document and refine your investment plans.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog(null)}>
                  <PlusCircle className="mr-2" />
                  New Strategy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingStrategy ? 'Edit Strategy' : 'Create New Strategy'}</DialogTitle>
                  <DialogDescription>
                    {editingStrategy ? 'Update your investment strategy details.' : 'Add a new strategy to your collection.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Long-term Growth" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description / Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your strategy, entry/exit points, risk tolerance, etc." className="min-h-[150px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save Strategy</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>

        {strategies.length > 0 ? (
          <div className="space-y-4">
            {strategies.map(strategy => (
              <Card key={strategy.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{strategy.title}</CardTitle>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(strategy)}>
                            <Edit className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => removeStrategy(strategy.id)}>
                            <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{strategy.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 text-muted-foreground">
            <CardContent>
                <BookText className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No Strategies Yet</h3>
                <p className="mt-2">Click "New Strategy" to document your first investment plan.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
