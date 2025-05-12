
'use server';

/**
 * @fileOverview Sentiment analysis flow for analyzing journal entries.
 *
 * - analyzeSentiment - Analyzes the sentiment of a journal entry.
 * Input and Output schemas are defined in '@/ai/schemas/sentiment-analysis-schemas.js'.
 */

import {ai} from '@/ai/genkit';
import { SentimentAnalysisInputSchema, SentimentAnalysisOutputSchema } from '@/ai/schemas/sentiment-analysis-schemas';

export async function analyzeSentiment(input) {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentimentAnalysisPrompt',
  input: {schema: SentimentAnalysisInputSchema},
  output: {schema: SentimentAnalysisOutputSchema},
  prompt: `Analyze the sentiment of the following journal entry and provide a sentiment score, overall sentiment, and a detailed analysis of the emotions expressed.\n\nJournal Entry: {{{journalEntry}}}`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: SentimentAnalysisInputSchema,
    outputSchema: SentimentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
