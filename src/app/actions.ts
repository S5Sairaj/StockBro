
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

        if (!quote) {
            throw new Error(`Invalid stock symbol: ${symbol}`);
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
            price: parseFloat(d.close.toFixed(2)),
        }));
        
        return { details, historical };
    } catch (error: any) {
        console.error('Failed to fetch stock data for', symbol, error.message);
        if (error.message && (error.message.includes('404') || error.message.includes('No data'))) {
             throw new Error(`Could not find stock data for symbol: ${symbol}. It may be an invalid symbol.`);
        }
        throw new Error('An external service error occurred while fetching stock data.');
    }
}


export async function getTrendingStocks() {
    try {
        const result = await yahooFinance.trendingSymbols('US', { count: 10 });
        const quotes = result.quotes?.filter(q => 
            q.quoteType === 'EQUITY' && 
            typeof q.regularMarketPrice === 'number' && 
            typeof q.regularMarketChange === 'number' &&
            typeof q.regularMarketChangePercent === 'number'
        ) || [];
        
        const trending = quotes.slice(0, 5).map(q => ({
            symbol: q.symbol,
            name: q.longName || q.shortName || q.symbol,
            price: q.regularMarketPrice || 0,
            change: q.regularMarketChange || 0,
            changePercent: q.regularMarketChangePercent || 0,
        }));

        return trending;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to fetch trending stocks:', error.message);
            console.error('Stack trace:', error.stack);
        } else {
            console.error('An unknown error occurred while fetching trending stocks:', error);
        }
        return [];
    }
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
    const selectors = ['article', '.caas-body', '.article-body', '#story-body', '.story-content'];
    let articleBody: Element | null = null;
    for (const selector of selectors) {
        articleBody = document.querySelector(selector);
        if (articleBody) break;
    }

    if (articleBody) {
        return articleBody.textContent || '';
    }

    // Fallback: If no specific container is found, gather all paragraph text
    const paragraphs = document.querySelectorAll('p');
    let text = '';
    paragraphs.forEach(p => {
        text += p.textContent + '\n';
    });
    
    return text.trim();

  } catch (error) {
    console.error('Error fetching article content:', error);
    return 'Could not retrieve article content.';
  }
}

export async function summarizeNewsArticle(url: string) {
    const articleText = await getArticleContent(url);
    if (!articleText || articleText.trim().length < 100) { // Check for minimal content length
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
