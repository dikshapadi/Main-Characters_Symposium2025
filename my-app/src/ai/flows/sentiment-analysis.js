
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
  prompt: `You are a supportive and empathetic assistant. Read the following journal entry and gently analyze its sentiment.
Provide your response in a warm, non-judgmental, and supportive tone. Avoid sounding judgmental or overly analytical.

For your response, include:
- A sentiment score.
- A clear, human-friendly summary of the overall sentiment.
- A thoughtful, encouraging analysis of the emotions expressed.
- Possible Emotions Detected: (e.g., frustration, contentment, overwhelm, excitement)
- Supportive Reflection: (Optional) A one- or two-sentence affirmation or supportive message based on the tone to encourage and uplift the user.

Journal Entry: {{{journalEntry}}}`,
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
