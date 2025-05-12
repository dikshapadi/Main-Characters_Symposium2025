
import { z } from 'genkit';

export const StressAnalysisInputSchema = z.object({
  hrv: z.number().describe("Heart Rate Variability in ms. Normal range for adults is typically between 20ms and 200ms. Lower HRV can indicate stress."),
  temperature: z.number().describe("Body temperature in Celsius. Normal human body temperature is around 37°C. Fever can indicate illness or stress response."),
  age: z.number().int().positive().describe("Age in years. Age can influence baseline HRV and stress response."),
  bloodPressureSystolic: z.number().int().positive().describe("Systolic blood pressure, the top number (e.g., 120 in 120/80 mmHg). Elevated blood pressure can be a sign of stress."),
  bloodPressureDiastolic: z.number().int().positive().describe("Diastolic blood pressure, the bottom number (e.g., 80 in 120/80 mmHg). Elevated blood pressure can be a sign of stress."),
  oxygenSaturation: z.number().min(0).max(100).describe("Oxygen saturation (SpO2) percentage. Normal is 95-100%. Lower levels might indicate respiratory issues, sometimes exacerbated by stress."),
  activityLevel: z.enum(["sedentary", "light", "moderate", "high"]).describe("General physical activity level for the day (sedentary, light, moderate, high). Can influence stress and HRV."),
  sleepHours: z.number().min(0).max(24).describe("Hours of sleep in the last 24 hours. Lack of sleep is a major stressor."),
});

export const StressAnalysisOutputSchema = z.object({
  stressLevel: z.number().min(0).max(10).describe("A numerical stress score from 0 (no stress) to 10 (extreme stress), calculated based on the provided health metrics."),
  stressCategory: z.enum(["Low", "Moderate", "High", "Extreme"]).describe("A category for the stress level (Low, Moderate, High, Extreme)."),
  primarySuggestion: z.object({
    title: z.string().describe("A short, catchy title for the primary suggestion (e.g., 'Deep Breaths', 'Quick Walk')."),
    text: z.string().describe("The main actionable suggestion to manage stress. Keep it concise and helpful."),
    icon: z.string().optional().describe("A suggested Lucide icon name for the primary suggestion (e.g., 'Wind', 'Footprints', 'Brain'). Only provide if highly relevant."),
  }).describe("The most important suggestion for the user based on their stress level."),
  secondarySuggestions: z.array(z.string().max(100)).max(3).describe("A list of 2-3 brief, actionable secondary suggestions to help manage stress."),
  analysisSummary: z.string().describe("A brief, empathetic summary (1-2 sentences) explaining the stress assessment based on the provided metrics. For example: 'Your HRV is a bit low and temperature slightly elevated, suggesting your body might be under some stress. Taking a moment to relax could be beneficial.'"),
});

export const HistoricalStressEntrySchema = z.object({
  date: z.string().describe("Date of the stress reading in 'M/D' format, e.g., '11/4'."),
  stress: z.number().min(0).max(10).describe("Stress level recorded on this date."),
});

export const StressHistorySchema = z.array(HistoricalStressEntrySchema);
