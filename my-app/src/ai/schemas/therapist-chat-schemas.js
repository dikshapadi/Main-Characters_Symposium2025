import { z } from 'genkit';

export const TherapistChatInputSchema = z.object({
  userInput: z.string().describe("The user's latest message to the AI therapist."),
  history: z.array(z.object({
    role: z.enum(['user', 'ai']),
    content: z.string(),
  })),
});

export const TherapistChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI therapist's response to the user."),
});