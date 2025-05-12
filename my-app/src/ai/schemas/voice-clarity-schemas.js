
import { z } from 'genkit';

export const VoiceClarityInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio recording to enhance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  settings: z.object({
    voiceReference: z.enum(['personal', 'generic']).describe('Voice reference type.'),
    enhancementLevel: z.enum(['light', 'moderate', 'strong']).describe('Overall enhancement level.'),
    noiseReduction: z.number().min(0).max(100).describe('Background noise reduction percentage (0-100).'),
    clarityEnhancement: z.number().min(0).max(100).describe('Speech clarity enhancement percentage (0-100).'),
    voicePreservation: z.number().min(0).max(100).describe('Original voice characteristics preservation percentage (0-100).'),
  }).describe('Configuration settings for voice enhancement.'),
});

export const VoiceClarityOutputSchema = z.object({
  processedAudioDataUri: z
    .string()
    .describe(
      "The enhanced audio recording, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  analysis: z.string().describe('A brief summary of the enhancements applied.'),
});
