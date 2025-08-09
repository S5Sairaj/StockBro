
'use client';

import { useState, useEffect, Suspense } from 'react';
import { getNews } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

type NewsItem = {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: string;
  thumbnail?: string;
};

const newsCategories = [
  { value: 'market-news', label: 'Market News' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'economy', label: 'Economy' },
  { value: 'crypto', label: 'Crypto' },
];

function NewsList({ category }: { category: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const fetchedNews = await getNews(category.replace('-', ' '));
      setNews(fetchedNews);
      setLoading(false);
    };

    fetchNews();
  }, [category]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-[150px] w-full rounded-md" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {news.map((item) => (
        <a href={item.link} key={item.uuid} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
          <Card className="h-full overflow-hidden">
            <CardHeader className="p-0">
              {item.thumbnail && (
                 <Image
                    src={item.thumbnail}
                    alt={item.title}
                    width={400}
                    height={225}
                    className="aspect-video w-full object-cover"
                    data-ai-hint="news article"
                  />
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold leading-tight">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.publisher} &bull; {item.providerPublishTime}</p>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState(newsCategories[0].value);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Financial News</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {newsCategories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Suspense fallback={<p>Loading...</p>}>
            {newsCategories.map((cat) => (
              <TabsContent key={cat.value} value={cat.value}>
                <NewsList category={cat.value} />
              </TabsContent>
            ))}
          </Suspense>
        </Tabs>
      </div>
    </div>
  );
}
