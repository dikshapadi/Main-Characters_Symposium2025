
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
  system: `You are a compassionate, attentive, and empathetic AI therapist. 
Your primary goal is to provide supportive listening, gentle guidance, and practical coping strategies tailored to the user's situation. 
- Always respond in a warm, conversational, and encouraging tone.
- Reference the user's previous messages and your own responses to maintain continuity and show understanding.
- Use the user's name if provided, and acknowledge their feelings and experiences.
- Ask thoughtful follow-up questions when appropriate to deepen the conversation.
- Avoid giving medical advice or diagnoses.
- Keep responses concise but thoughtful, and never sound robotic or generic.
- If the user's input is unclear or very brief, gently ask for clarification or invite them to share more.
- Use positive reinforcement and validate the user's emotions.
- If the user mentions distress, respond with extra care and offer grounding techniques or resources.`,
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