
import { z } from 'genkit';

export const SentimentAnalysisInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The journal entry to analyze for sentiment.'),
});

export const SentimentAnalysisOutputSchema = z.object({
  sentiment: z.string().describe('The overall sentiment of the journal entry (e.g., positive, negative, neutral).'),
  score: z.number().describe('A numerical score representing the sentiment, from -1 (negative) to 1 (positive).'),
  analysis: z.string().describe('A more detailed analysis of the emotions expressed in the journal entry.'),
});
