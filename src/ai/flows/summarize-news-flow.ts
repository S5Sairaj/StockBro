'use server';
/**
 * @fileOverview A news summarization AI agent.
 *
 * - summarizeNews - A function that handles summarizing a news article.
 * - SummarizeNewsInput - The input type for the summarizeNews function.
 * - SummarizeNewsOutput - The return type for the summarizeNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNewsInputSchema = z.object({
  article: z.string().describe("The full text content of the news article to be summarized."),
});
export type SummarizeNewsInput = z.infer<typeof SummarizeNewsInputSchema>;

const SummarizeNewsOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the news article, capturing the key points."),
  impact: z.string().describe("A brief analysis of the potential impact of this news on the stock market or the specific company mentioned."),
});
export type SummarizeNewsOutput = z.infer<typeof SummarizeNewsOutputSchema>;

export async function summarizeNews(input: SummarizeNewsInput): Promise<SummarizeNewsOutput> {
  return summarizeNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewsPrompt',
  input: {schema: SummarizeNewsInputSchema},
  output: {schema: SummarizeNewsOutputSchema},
  prompt: `You are a financial news analyst. Your task is to provide a clear and concise summary of the provided article and analyze its potential impact on the financial markets.

Article Content:
{{{article}}}

Based on the article, provide:
1.  A brief, neutral summary of the key information presented.
2.  An analysis of the potential market impact. Consider whether this news is likely to be positive, negative, or neutral for the company or sector involved.
`,
});

const summarizeNewsFlow = ai.defineFlow(
  {
    name: 'summarizeNewsFlow',
    inputSchema: SummarizeNewsInputSchema,
    outputSchema: SummarizeNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
