'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNews } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface NewsArticle {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: string;
    thumbnail?: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                setLoading(true);
                const newsData = await getNews();
                setNews(newsData);
            } catch (error) {
                console.error("Failed to load news", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Market News</h2>
            </div>

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
                {!loading && news.map((article) => (
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
            </div>
        </div>
    );
}
