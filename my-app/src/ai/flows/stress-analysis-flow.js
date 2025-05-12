
'use server';
/**
 * @fileOverview A stress analysis AI agent.
 *
 * - analyzeStressAndSuggest - A function that handles the stress analysis and suggestion process.
 * - StressAnalysisInputSchema - The input type for the analyzeStressAndSuggest function.
 * - StressAnalysisOutputSchema - The return type for the analyzeStressAndSuggest function.
 */

import { ai } from '@/ai/genkit';
import { StressAnalysisInputSchema, StressAnalysisOutputSchema } from '@/ai/schemas/stress-analysis-schemas';

export async function analyzeStressAndSuggest(input) {
  return stressAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stressAnalysisPrompt',
  input: { schema: StressAnalysisInputSchema },
  output: { schema: StressAnalysisOutputSchema },
  prompt: `You are a compassionate AI health assistant. Your goal is to analyze the provided health metrics to assess the user's stress level and offer helpful, actionable suggestions.

User's Health Metrics:
- Heart Rate Variability (HRV): {{{hrv}}} ms
- Body Temperature: {{{temperature}}} °C
- Age: {{{age}}} years
- Blood Pressure (Systolic/Diastolic): {{{bloodPressureSystolic}}}/{{{bloodPressureDiastolic}}} mmHg
- Oxygen Saturation (SpO2): {{{oxygenSaturation}}}%
- Activity Level: {{{activityLevel}}}
- Sleep Hours (last 24h): {{{sleepHours}}} hours

Based on these metrics, perform the following:
1.  **Calculate Stress Level (0-10):** Determine a stress level score between 0 (no stress) and 10 (extreme stress). Consider how these metrics deviate from typical healthy ranges and interact with each other. For example, low HRV, high blood pressure, and poor sleep might indicate higher stress.
2.  **Determine Stress Category:** Categorize the stress level as "Low" (0-3), "Moderate" (4-6), "High" (7-8), or "Extreme" (9-10).
3.  **Provide Analysis Summary:** Write a brief, empathetic summary (1-2 sentences) explaining your stress assessment. Connect it to the metrics if possible (e.g., "Your HRV is a bit on the lower side today, and combined with less sleep, it suggests your body might be feeling some stress.").
4.  **Generate Primary Suggestion:** Offer one main, actionable suggestion. Include a title and text. If a relevant Lucide icon name comes to mind (e.g., 'Wind' for breathing, 'Leaf' for nature, 'Bed' for rest), provide it.
5.  **Generate Secondary Suggestions:** List 2-3 brief, diverse, and actionable secondary suggestions.

Focus on being supportive and providing practical advice. Avoid medical diagnoses. If metrics are severely abnormal, gently suggest consulting a healthcare professional as a general piece of advice within a suggestion if appropriate, but prioritize stress management techniques.

Example of how metrics influence stress:
- Low HRV: often associated with higher stress.
- High resting heart rate (not directly provided, but BP and HRV are related): can indicate stress.
- Elevated blood pressure: common stress response.
- Fever/High temperature: can be illness, but also stress-induced for some.
- Low oxygen saturation: usually medical, but chronic stress can impact breathing.
- Insufficient sleep: strong stressor.
- Activity level: Both very low and excessively high activity without recovery can be stressful.

Return the full output according to the defined schema.
`,
});

const stressAnalysisFlow = ai.defineFlow(
  {
    name: 'stressAnalysisFlow',
    inputSchema: StressAnalysisInputSchema,
    outputSchema: StressAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate stress analysis.");
    }
    return output;
  }
);
