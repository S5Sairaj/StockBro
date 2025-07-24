'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNews } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NewsArticle {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: string;
    thumbnail?: string;
}

const newsCategories = [
    { value: 'market-news', label: 'Market News', query: 'market news' },
    { value: 'booming-stocks', label: 'Booming Stocks', query: 'top gaining stocks' },
    { value: 'indicators', label: 'Indicators', query: 'stock market technical indicators' },
    { value: 'new-stocks-ipos', label: 'New Stocks & IPOs', query: 'new stocks IPOs' }
];

function NewsGrid({ articles, loading }: { articles: NewsArticle[], loading: boolean }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && Array.from({ length: 12 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="w-full h-40" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-5 w-4/5 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-4 w-1/2" />
                    </CardFooter>
                </Card>
            ))}
            {!loading && articles.map((article) => (
                <Link href={article.link} key={article.uuid} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader className="p-0">
                            {article.thumbnail && 
                                <Image 
                                    src={article.thumbnail} 
                                    alt={article.title} 
                                    width={400} 
                                    height={225} 
                                    className="rounded-t-lg object-cover aspect-video"
                                />
                            }
                        </CardHeader>
                        <CardContent className="p-4">
                            <CardTitle className="text-lg leading-snug font-bold mb-2">{article.title}</CardTitle>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between">
                           <span>{article.publisher}</span>
                           <span>{article.providerPublishTime}</span>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
             {!loading && articles.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-10">
                    <p>No news articles found for this category.</p>
                </div>
            )}
        </div>
    );
}

export default function NewsPage() {
    const [news, setNews] = useState<Record<string, NewsArticle[]>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState(newsCategories[0].value);

    const fetchNewsForCategory = async (categoryValue: string, query: string) => {
        if (news[categoryValue]) return; // Already fetched

        try {
            setLoading(prev => ({...prev, [categoryValue]: true}));
            const newsData = await getNews(query);
            setNews(prev => ({ ...prev, [categoryValue]: newsData }));
        } catch (error) {
            console.error(`Failed to load news for ${categoryValue}`, error);
            setNews(prev => ({...prev, [categoryValue]: []}));
        } finally {
            setLoading(prev => ({...prev, [categoryValue]: false}));
        }
    };
    
    useEffect(() => {
        // Fetch news for all categories on initial load
        newsCategories.forEach(category => {
            fetchNewsForCategory(category.value, category.query);
        });
    }, []);


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Market News</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    {newsCategories.map(cat => (
                         <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
                    ))}
                </TabsList>
                {newsCategories.map(cat => (
                    <TabsContent key={cat.value} value={cat.value}>
                        <NewsGrid articles={news[cat.value] || []} loading={loading[cat.value] !== false} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
