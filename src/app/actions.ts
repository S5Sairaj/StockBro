
'use server';

import yahooFinance from 'yahoo-finance2';
import jsdom from 'jsdom';
import { summarizeNews } from '@/ai/flows/summarize-news-flow';

const { JSDOM } = jsdom;

function getStartDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
        case 'weekly':
            // 1 year of weekly data
            return new Date(new Date().setFullYear(now.getFullYear() - 1));
        case 'monthly':
             // 5 years of monthly data
            return new Date(new Date().setFullYear(now.getFullYear() - 5));
        case 'daily':
        default:
            // 3 months of daily data
            return new Date(new Date().setMonth(now.getMonth() - 3));
    }
}

export async function getStockData(symbol: string, timeframe: string) {
    try {
        const queryOptions = {
            period1: getStartDate(timeframe),
            interval: (timeframe === 'weekly' ? '1wk' : timeframe === 'monthly' ? '1mo' : '1d') as '1d' | '1wk' | '1mo',
        };
        
        const summary = await yahooFinance.quoteSummary(symbol, {
             modules: ["summaryProfile", "summaryDetail", "financialData", "price"] 
        });

        const [quote, history] = await Promise.all([
             yahooFinance.quote(symbol),
             yahooFinance.historical(symbol, queryOptions),
        ]);

        if (!quote || !history || history.length === 0) {
             throw new Error(`No data found for symbol: ${symbol}. It may be delisted or invalid.`);
        }

        const details = {
            name: quote.longName || `${symbol.toUpperCase()} Company`,
            description: summary.summaryProfile?.longBusinessSummary || `Description for ${symbol.toUpperCase()}.`,
            exchange: quote.fullExchangeName || 'N/A',
            marketCap: summary.summaryDetail?.marketCap,
            peRatio: summary.summaryDetail?.trailingPE,
            dividendYield: summary.summaryDetail?.dividendYield,
            analystRecommendation: summary.financialData?.recommendationKey,
        };

        const historical = history.map(d => ({
            date: d.date.toISOString().split('T')[0],
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
        
        return { details, historical };
    } catch (error: any) {
        console.error('Failed to fetch stock data for', symbol, error.message);
        if (error.message && (error.message.includes('404') || error.message.includes('No data'))) {
             throw new Error(`Could not find stock data for symbol: ${symbol}. Please check if the symbol is correct.`);
        }
        throw new Error('An external service error occurred while fetching stock data.');
    }
}


export async function getTrendingStocks() {
    const regions = ['US', 'GB', 'IN', 'CA', 'AU', 'DE', 'HK'];
    for (const region of regions) {
        try {
            const result = await yahooFinance.trendingSymbols(region, { count: 15 });
            if (result && result.quotes) {
                const uniqueSymbols = new Set();
                const trending = result.quotes.filter(q => {
                    const isEquity = q.quoteType === 'EQUITY';
                    const hasPrice = typeof q.regularMarketPrice === 'number';
                    const hasChange = typeof q.regularMarketChange === 'number';
                    const isUnique = !uniqueSymbols.has(q.symbol);
                    if (isEquity && hasPrice && hasChange && isUnique) {
                        uniqueSymbols.add(q.symbol);
                        return true;
                    }
                    return false;
                }).map(q => ({
                    symbol: q.symbol,
                    name: q.longName || q.shortName || q.symbol,
                    price: q.regularMarketPrice!,
                    change: q.regularMarketChange!,
                    changePercent: q.regularMarketChangePercent!,
                }));

                if (trending.length >= 5) {
                    return trending.slice(0, 5);
                }
            }
        } catch (error) {
            console.warn(`Could not fetch trending stocks for region ${region}:`, error);
        }
    }
    
    console.error('Failed to fetch trending stocks from any region.');
    return []; // Return empty if no region was successful
}

export async function getNews(query: string = 'market news') {
    try {
        const result = await yahooFinance.search(query, { newsCount: 40 });
        return result.news.map(item => ({
            uuid: item.uuid,
            title: item.title,
            publisher: item.publisher,
            link: item.link,
            providerPublishTime: new Date(item.providerPublishTime * 1000).toLocaleDateString(),
            thumbnail: item.thumbnail?.resolutions?.find(t => t.tag === 'm')?.url
        }));
    } catch (error) {
        console.error(`Failed to fetch news for query "${query}":`, error);
        return [];
    }
}

async function getArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Try common selectors for article bodies
    const selectors = ['article', '.caas-body', '.article-body', '#story-body', '.story-content', 'div[data-component="Component-Caas-Content"]'];
    let articleBody: Element | null = null;
    for (const selector of selectors) {
        articleBody = document.querySelector(selector);
        if (articleBody) break;
    }

    if (articleBody) {
        // Remove known noise from the article body before extracting text
        articleBody.querySelectorAll('figure, .ad, .related-content, .player-unavailable').forEach(el => el.remove());
        return articleBody.textContent || '';
    }

    // Fallback: If no specific container is found, gather all paragraph text from the body
    const paragraphs = document.body.querySelectorAll('p');
    let text = '';
    paragraphs.forEach(p => {
        // Simple filter to avoid boilerplate/ad text
        if (p.textContent && p.textContent.length > 80) {
            text += p.textContent + '\n';
        }
    });
    
    if (text.trim().length > 100) {
      return text.trim();
    }
    
    // If still nothing, return a more specific message.
    return "Could not retrieve the article content to summarize.";

  } catch (error) {
    console.error('Error fetching article content:', error);
    return 'Could not retrieve the article content to summarize.';
  }
}

export async function summarizeNewsArticle(url: string) {
    const articleText = await getArticleContent(url);
    if (!articleText || articleText.trim().length < 100 || articleText === "Could not retrieve the article content to summarize.") {
        return { summary: "Could not retrieve enough article content to summarize.", impact: "N/A" };
    }
    return await summarizeNews({ article: articleText });
}

export async function getComparisonData(symbols: string[]) {
    try {
        const promises = symbols.map(symbol => 
            yahooFinance.quoteSummary(symbol.toUpperCase(), {
                modules: ["price", "summaryDetail", "financialData"]
            })
        );
        
        const results = await Promise.all(promises);

        const data = results.map((summary, index) => {
            if (!summary.price || !summary.summaryDetail || !summary.financialData) {
                return {
                    symbol: symbols[index].toUpperCase(),
                    name: `${symbols[index].toUpperCase()} (Data not found)`,
                    price: 'N/A',
                    marketCap: 'N/A',
                    peRatio: 'N/A',
                    dividendYield: 'N/A',
                    analystRecommendation: 'N/A'
                };
            }
            return {
                symbol: summary.price.symbol,
                name: summary.price.longName || summary.price.shortName,
                price: summary.price.regularMarketPrice,
                marketCap: summary.summaryDetail.marketCap,
                peRatio: summary.summaryDetail.trailingPE,
                dividendYield: summary.summaryDetail.dividendYield,
                analystRecommendation: summary.financialData.recommendationKey,
            };
        });

        return data;

    } catch (error) {
        console.error('Failed to fetch comparison data', error);
        throw new Error('Failed to fetch comparison data. Please check the stock symbols.');
    }
}
