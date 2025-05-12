
import { z } from 'genkit';

export const TherapistChatInputSchema = z.object({
  userInput: z.string().describe("The user's latest message to the AI therapist."),
  // Optional: Add conversationHistory: z.array(z.object({ role: z.enum(['user', 'model']), parts: z.array(z.object({text: z.string()})) })).optional().describe("Previous conversation turns.")
});

export const TherapistChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI therapist's response to the user."),
});
