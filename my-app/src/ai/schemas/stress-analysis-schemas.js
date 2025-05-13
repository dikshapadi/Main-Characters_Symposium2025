import { z } from 'genkit';

// Updated Input Schema
export const StressAnalysisInputSchema = z.object({
  HR: z.number().min(50).max(160).describe("Heart Rate in bpm. Range: 50 to 160."),
  HRV: z.number().min(15).max(120).describe("Heart Rate Variability in ms. Range: 15 to 120."),
  SpO2: z.number().min(80).max(100).describe("Oxygen Saturation percentage. Range: 80 to 100."),
  Steps: z.number().min(0).max(600).describe("Number of steps. Range: 0 to 600."),
  Distance: z.number().min(0.0).max(1.0).describe("Distance in km. Range: 0.0 to 1.0."),
  Calories: z.number().min(0.0).max(10).describe("Calories burned. Range: 0.0 to 10."),
  ActiveTime: z.number().min(0).max(5).describe("Active time in minutes. Range: 0 to 5."),
  SleepDuration: z.number().min(0).max(9).describe("Sleep duration in hours. Range: 0 to 9."),
  SleepEfficiency: z.number().min(10).max(95).describe("Sleep efficiency percentage. Range: 10 to 95."),
  Height: z.number().min(130).max(190).describe("Height in cm. Range: 130 to 190."),
  Weight: z.number().min(10).max(100).describe("Weight in kg. Range: 10 to 100."),
  Age: z.number().min(1).max(65).describe("Age in years. Range: 1 to 65."),
  Sex: z.enum(["Female", "Male", "Other"]).describe("Sex: Female, Male, or Other."),
  DrinkingHabits: z.enum(["None", "Occasional", "Regular"]).describe("Drinking habits: None, Occasional, Regular."),
  SmokingHabits: z.enum(["Non-smoker", "Occasional", "Regular"]).describe("Smoking habits: Non-smoker, Occasional, Regular."),
  PastMedicalHistory: z.enum(["None", "Diabetes", "Hypertension", "Other"]).describe("Past medical history: None, Diabetes, Hypertension, Other."),
  Depression: z.enum(["No", "Yes"]).describe("Depression: No or Yes."),
  DayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).describe("Day of the week."),
  Context: z.enum(["Sleep", "Home", "Work", "Commute", "Exercise", "Social"]).describe("Context: Sleep, Home, Work, Commute, Exercise, Social."),
  modelStressLevel: z.number().min(1).max(3).describe("Stress level from the model (1-3)."),
  modelStressCategory: z.enum(["Low", "Medium", "High"]).describe("Stress category from the model."),
  modelProbabilities: z.record(z.string(), z.number()).describe("Probabilities for each stress category from the model."),
});

// You may want to update the output schema as well, depending on your prediction logic.
// Here is a generic output schema for stress prediction:
export const StressAnalysisOutputSchema = z.object({
  stressLevel: z.number().min(0).max(10).describe("A numerical stress score from 0 (no stress) to 10 (extreme stress), calculated based on the provided health metrics."),
  stressCategory: z.enum(["Low", "Moderate", "High", "Extreme"]).describe("A category for the stress level (Low, Moderate, High, Extreme)."),
  probability: z.number().min(0).max(1).optional().describe("Optional: Probability/confidence of the prediction."),
  primarySuggestion: z.object({
    title: z.string().describe("A short, catchy title for the primary suggestion (e.g., 'Deep Breaths', 'Quick Walk')."),
    text: z.string().describe("The main actionable suggestion to manage stress. Keep it concise and helpful."),
    icon: z.string().optional().describe("A suggested Lucide icon name for the primary suggestion (e.g., 'Wind', 'Footprints', 'Brain'). Only provide if highly relevant."),
  }).describe("The most important suggestion for the user based on their stress level."),
  secondarySuggestions: z.array(z.string().max(100)).max(3).describe("A list of 2-3 brief, actionable secondary suggestions to help manage stress."),
  analysisSummary: z.string().describe("A brief, empathetic summary (1-2 sentences) explaining the stress assessment based on the provided metrics."),
});

// Historical schemas can remain as is, or you can update them to match the new stress level values:
export const HistoricalStressEntrySchema = z.object({
  date: z.string().describe("Date of the stress reading in 'M/D' format, e.g., '11/4'."),
  stress: z.number().min(0).max(10).describe("Stress level recorded on this date."),
});

export const StressHistorySchema = z.array(HistoricalStressEntrySchema);
