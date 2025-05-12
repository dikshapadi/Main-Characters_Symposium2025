
'use server';
/**
 * @fileOverview AI Therapist chat flow.
 *
 * - getTherapistResponse - Gets a response from the AI therapist.
 * Input and Output schemas are defined in '@/ai/schemas/therapist-chat-schemas.js'.
 */

import { ai } from '@/ai/genkit';
import { TherapistChatInputSchema, TherapistChatOutputSchema } from '@/ai/schemas/therapist-chat-schemas';

export async function getTherapistResponse(input) {
  return therapistChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'therapistChatPrompt',
  input: { schema: TherapistChatInputSchema },
  output: { schema: TherapistChatOutputSchema },
  system: "You are a compassionate and empathetic AI therapist. Your goal is to provide supportive listening, gentle guidance, and helpful coping strategies. Avoid giving medical advice or diagnoses. Maintain a calm, understanding, and non-judgmental tone. Keep responses concise but thoughtful. Address the user directly and warmly. If the user's input is very short or unclear, you can ask a gentle clarifying question.",
  prompt: `The user says: {{{userInput}}}

Your thoughtful response as their AI therapist:`,
  config: {
    // Temperature might be slightly lower for more consistent, less "creative" therapeutic responses.
    // temperature: 0.6, 
     safetySettings: [ // Adjust safety settings if needed for therapeutic context
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
       {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }
});

const therapistChatFlow = ai.defineFlow(
  {
    name: 'therapistChatFlow',
    inputSchema: TherapistChatInputSchema,
    outputSchema: TherapistChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { aiResponse: "I'm sorry, I couldn't process that. Could you try rephrasing?" };
    }
    return output;
  }
);
