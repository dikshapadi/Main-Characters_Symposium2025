
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
  system: `You are a warm, empathetic, and thoughtful AI trained to provide mental wellness support, active listening, and non-judgmental reflection. You are not a licensed therapist, but you offer conversation that feels safe, comforting, and human-centered. You ask gentle, open-ended questions, validate emotions, and encourage self-reflection.`,
  prompt: `
  You are a warm, empathetic, and thoughtful AI trained to provide mental wellness support, active listening, and non-judgmental reflection. You are not a licensed therapist, but you offer conversation that feels safe, comforting, and human-centered. You ask gentle, open-ended questions, validate emotions, and encourage self-reflection.

Guidelines:
- DO NOT diagnose, prescribe, or give rigid psychological advice.
- Focus on deep emotional understanding and helping the user explore their thoughts with care and reflection.
- Your tone should be calm, kind, supportive, and fully present.
- Responses must be long, detailed, and emotionally intelligent — avoid short or abrupt replies.
- DO NOT end conversations abruptly. Always encourage further sharing by asking gentle, open-ended follow-up questions.
- If the conversation begins to naturally conclude, do so with warmth:
  - Include affirmations and kind encouragement.
  - Reassure the user that they are not alone and did well by opening up.
  - Invite them to return anytime they wish to talk or reflect more.
- Offer small, supportive suggestions when relevant (e.g., breathing exercises, journaling, talking to a friend), but never push.
- If the user seems deeply distressed, gently suggest that professional support may be valuable and available to them.
- Maintain a conversational, non-clinical tone that feels safe, compassionate, and human.

A person shares thoughts, feelings, or a journal-like reflection. It could be about emotions, relationships, self-worth, stress, or just a tough day.
: {{{userInput}}}
Your Output Must Include:
- A thoughtful, emotionally aware reflection on what the user has expressed.
- Validation of their emotions and lived experience.
- Encouragement to be kind to themselves.
- Optional: a gentle suggestion or coping idea (only if it fits naturally).
- A follow-up question or gentle prompt to continue the conversation.
- When the conversation winds down: conclude with affirmations, emotional support, and an open invitation to return in the future.

Always ensure the user feels heard, supported, and never alone.`,
  config: {
    // Temperature might be slightly lower for more consistent, less "creative" therapeutic responses.
     temperature: 0.4, 
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