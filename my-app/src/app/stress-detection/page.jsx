"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  UserCog,
  HeartPulse,
  Activity,
  ActivitySquare,
  Droplets,
  Footprints,
  Zap,
  Timer,
  Bed,
  MoonStar,
  User,
  Flame,

  MapPin,
  Home,
  Smile,
  Meh,
  Frown,
  ClipboardEdit,
  Ruler,
  TrendingUp,
  BarChart3,
  Brain,
  AlertCircle,
  Bell,
  Settings,
  RefreshCw,
  Calendar,
  Weight,
  UserCircle,
  GlassWater,
  Wine,
  Cigarette,
  Hospital,
  Sad,
  Gauge,
  Globe,
  LandPlot,Stethoscope
} from "lucide-react";

import * as LucideIcons from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeStressAndSuggest } from "@/ai/flows/stress-analysis-flow";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const initialTrackedMetrics = [
  { key: "HR", label: "Heart Rate", defaultValue: 75, unit: "bpm", icon: HeartPulse, inputType: "number", min: 50, max: 160, placeholder: "e.g., 75" },
  { key: "HRV", label: "HRV", defaultValue: 65, unit: "ms", icon: ActivitySquare, inputType: "number", min: 15, max: 120, placeholder: "e.g., 65" },
  { key: "SpO2", label: "Oxygen Saturation", defaultValue: 98, unit: "%", icon: Droplets, inputType: "number", min: 88, max: 100, placeholder: "e.g., 98" },
  { key: "Steps", label: "Steps", defaultValue: 300, unit: "", icon: Footprints, inputType: "number", min: 0, max: 600, placeholder: "e.g., 300" },
  { key: "Distance", label: "Distance", defaultValue: 0.3, unit: "km", icon: MapPin, inputType: "number", min: 0.0, max: 0.6, step: "0.01", placeholder: "e.g., 0.3" },
  { key: "Calories", label: "Calories", defaultValue: 6, unit: "kcal", icon: Flame, inputType: "number", min: 2, max: 10, step: "0.1", placeholder: "e.g., 6" },
  { key: "ActiveTime", label: "Active Time", defaultValue: 2, unit: "min", icon: Timer, inputType: "number", min: 0, max: 5, placeholder: "e.g., 2" },
  { key: "SleepDuration", label: "Sleep Duration", defaultValue: 7, unit: "hours", icon: Bed, inputType: "number", min: 0, max: 9, step: "0.1", placeholder: "e.g., 7" },
  { key: "SleepEfficiency", label: "Sleep Efficiency", defaultValue: 85, unit: "%", icon: MoonStar, inputType: "number", min: 60, max: 95, placeholder: "e.g., 85" },
  { key: "Height", label: "Height", defaultValue: 170, unit: "cm", icon: Ruler, inputType: "number", min: 130, max: 190, placeholder: "e.g., 170" },
  { key: "Weight", label: "Weight", defaultValue: 65, unit: "kg", icon: Weight, inputType: "number", min: 10, max: 100, placeholder: "e.g., 65" },
  { key: "Age", label: "Age", defaultValue: 30, unit: "years", icon: User, inputType: "number", min: 18, max: 65, placeholder: "e.g., 30" },
  { key: "Sex", label: "Sex", defaultValue: "Female", unit: "", icon: UserCog, inputType: "select", options: ["Female", "Male", "Other"] },
  { key: "DrinkingHabits", label: "Drinking Habits", defaultValue: "Occasional", unit: "", icon: GlassWater, inputType: "select", options: ["None", "Occasional", "Regular"] },
  { key: "SmokingHabits", label: "Smoking Habits", defaultValue: "Non-smoker", unit: "", icon: Cigarette, inputType: "select", options: ["Non-smoker", "Occasional", "Regular"] },
  { key: "PastMedicalHistory", label: "Past Medical History", defaultValue: "Hypertension", unit: "", icon: Stethoscope, inputType: "select", options: ["None", "Diabetes", "Hypertension", "Other"] },
  { key: "Depression", label: "Depression", defaultValue: "No", unit: "", icon: Frown, inputType: "select", options: ["No", "Yes"] },
  { key: "Context", label: "Context", defaultValue: "Home", unit: "", icon: Globe, inputType: "select", options: ["Sleep", "Home", "Work", "Commute", "Exercise", "Social"] },
];

const getCurrentDayOfWeek = () => {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
};
const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = LucideIcons[name];
  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />; // Default icon
  }
  return <IconComponent {...props} />;
};

// Define which metrics to display in "Current Status"
const displayedMetricKeys = [
  "HR",
  "HRV",
  "SpO2",
  "Steps",
  "Distance",
  "Calories",
  "ActiveTime",
  "SleepDuration",
  "SleepEfficiency",
];

export default function StressDetectionPage() {
  const [currentMetricValues, setCurrentMetricValues] = useState(() => {
    const initial = {};
    initialTrackedMetrics.forEach(metric => {
      initial[metric.key] = metric.defaultValue;
    });
    return initial;
  });
  const [displayedMetricsInStatus, setDisplayedMetricsInStatus] = useState({});


  const [isLoading, setIsLoading] = useState(false);
  const [stressAnalysis, setStressAnalysis] = useState(null);
  const [stressHistory, setStressHistory] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem("stressHistory");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        // Basic validation
        if (Array.isArray(parsedHistory) && parsedHistory.every(item => typeof item.date === 'string' && typeof item.stress === 'number')) {
          setStressHistory(parsedHistory);
        } else {
          localStorage.removeItem("stressHistory"); // Clear invalid data
        }
      } catch (e) {
        console.error("Failed to parse stress history from localStorage", e);
        localStorage.removeItem("stressHistory");
      }
    }
    
    // Initialize displayedMetricsInStatus with only the selected metrics
    const initialDisplayMetrics = {};
    initialTrackedMetrics.forEach(metric => {
      if (displayedMetricKeys.includes(metric.key)) {
        initialDisplayMetrics[metric.key] = { value: metric.defaultValue, unit: metric.unit, label: metric.label, icon: metric.icon };
      }
    });
    setDisplayedMetricsInStatus(initialDisplayMetrics);

  }, []);

  useEffect(() => {
    if (stressHistory.length > 0) {
      localStorage.setItem("stressHistory", JSON.stringify(stressHistory));
    }
  }, [stressHistory]);

  const handleInputChange = (key, value) => {
    setCurrentMetricValues(prev => ({ ...prev, [key]: initialTrackedMetrics.find(m => m.key === key)?.inputType === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

const handleUpdateMetrics = async () => {
  setIsLoading(true);
  setStressAnalysis(null);

  // Validate and format metrics for API
  const metricsForAPI = {
    UserID: "U999", // Default user ID
    HR: Number(currentMetricValues.HR),
    HRV: Number(currentMetricValues.HRV),
    SpO2: Number(currentMetricValues.SpO2),
    Steps: Number(currentMetricValues.Steps),
    Distance: Number(currentMetricValues.Distance),
    Calories: Number(currentMetricValues.Calories),
    ActiveTime: Number(currentMetricValues.ActiveTime),
    SleepDuration: Number(currentMetricValues.SleepDuration),
    SleepEfficiency: Number(currentMetricValues.SleepEfficiency),
    Height: Number(currentMetricValues.Height),
    Weight: Number(currentMetricValues.Weight),
    Age: Number(currentMetricValues.Age),
    Sex: currentMetricValues.Sex,
    DrinkingHabits: currentMetricValues.DrinkingHabits,
    SmokingHabits: currentMetricValues.SmokingHabits,
    PastMedicalHistory: currentMetricValues.PastMedicalHistory === "" ? null : currentMetricValues.PastMedicalHistory,
    Depression: currentMetricValues.Depression,
    Context: currentMetricValues.Context
  };

  // Only display selected metrics in "Current Status"
  const newDisplayedMetrics = {};
  initialTrackedMetrics.forEach(metric => {
    if (displayedMetricKeys.includes(metric.key)) {
      newDisplayedMetrics[metric.key] = {
        value: currentMetricValues[metric.key],
        unit: metric.unit,
        label: metric.label,
        icon: metric.icon
      };
    }
  });
  setDisplayedMetricsInStatus(newDisplayedMetrics);

  try {
    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metricsForAPI),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
    }

    const result = await response.json();
    console.log(result);

    // Combine metrics with model results for AI analysis
    const combinedInput = {
      ...metricsForAPI,
      modelStressLevel: result.stressLevel,
      modelStressCategory: result.stressCategory,
      modelProbabilities: result.probabilities,
      DayOfWeek: getCurrentDayOfWeek()
    };

    // Get suggestions and analysis from AI
    const aiAnalysis = await analyzeStressAndSuggest(combinedInput);

    // Combine model results with AI suggestions
    const stressAnalysis = {
      stressLevel: result.stressLevel,
      stressCategory: result.stressCategory,
      probability: Object.values(result.probabilities).find(p => p === Math.max(...Object.values(result.probabilities))),
      primarySuggestion: aiAnalysis.primarySuggestion,
      secondarySuggestions: aiAnalysis.secondarySuggestions,
      analysisSummary: aiAnalysis.analysisSummary
    };

    setStressAnalysis(stressAnalysis);

    const today = new Date();
    const newHistoryEntry = {
      date: today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      stress: result.stressLevel,
    };
    setStressHistory(prevHistory => {
      const updatedHistory = [...prevHistory, newHistoryEntry];
      return updatedHistory.slice(-14);
    });

    toast({
      title: "Stress Analysis Complete",
      description: stressAnalysis.stressCategory ? `Your estimated stress level is ${stressAnalysis.stressCategory}.` : "Analysis updated.",
    });
  } catch (error) {
    console.error("Stress analysis error:", error);
    toast({
      title: "Analysis Error",
      description: error.message || "Could not analyze stress. Please ensure the server is running and try again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const getStressBadgeVariant = (category) => {
    if (!category) return "secondary";
    switch (category.toLowerCase()) {
      case "low": return "default";
      case "medium": // Handle both "medium" and "moderate" cases
      case "moderate": return "secondary";
      case "high": return "destructive";
      default: return "outline";
    }
  };
  
  const getStressIcon = (level) => {
    if (level === null || level === undefined) return <Meh className="h-5 w-5" />;
    if (level === 1) return <Smile className="h-5 w-5 text-green-500" />;
    if (level === 2) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Stress Detection</h1>
        <p className="text-muted-foreground">Analyze your health metrics to understand and manage your stress levels.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardEdit className="h-5 w-5 text-primary" /> Log Your Metrics</CardTitle>
          <CardDescription>Enter your latest health data to update the analysis and get insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialTrackedMetrics.map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <div key={metric.key} className="space-y-1">
                  <Label htmlFor={metric.key} className="flex items-center gap-1">
                    <MetricIcon className="h-4 w-4 text-muted-foreground" />
                    {metric.label} {metric.unit && `(${metric.unit})`}
                  </Label>
                  {metric.inputType === "select" ? (
                    <select
                      id={metric.key}
                      value={currentMetricValues[metric.key] || ""}
                      onChange={(e) => handleInputChange(metric.key, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {metric.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                    </select>
                  ) : (
                    <Input
                      id={metric.key}
                      type={metric.inputType}
                      step={metric.step}
                      value={currentMetricValues[metric.key] || ""}
                      onChange={(e) => handleInputChange(metric.key, e.target.value)}
                      placeholder={metric.placeholder}
                      className="bg-input/50"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateMetrics} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Analyzing..." : "Update & Analyze Stress"}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Stress Trends</CardTitle>
              <CardDescription>Your stress levels over time (1 = Low Stress, 3 = High Stress).</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => { /* Future: Implement refresh logic */ toast({ title: "Chart refreshed (placeholder)"}) }}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {stressHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stressHistory} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[1, 3]} allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} ticks={[1, 2, 3]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                  />
                  <Line type="monotone" dataKey="stress" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Log your metrics to see stress trends.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Current Status</CardTitle>
            <CardDescription>Based on your latest logged metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && !stressAnalysis ? (
                <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="ml-3 text-muted-foreground">Analyzing...</p>
                </div>
            ) : stressAnalysis?.stressCategory ? (
              <div className="text-center mb-4">
                <Badge variant={getStressBadgeVariant(stressAnalysis.stressCategory)} className="text-lg px-4 py-2">
                  {getStressIcon(stressAnalysis.stressLevel)} <span className="ml-2">{stressAnalysis.stressCategory} Stress</span> 
                </Badge>
                {/* {stressAnalysis.stressLevel !== null && <p className="text-sm text-muted-foreground mt-1">Score: {stressAnalysis.stressLevel}/10</p>} */}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">Update metrics for current stress status.</p>
            )}
            <div className="space-y-2">
              {Object.entries(displayedMetricsInStatus).map(([key, metric]) => {
                const MetricIcon = metric.icon;
                return (
                  <div key={key} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
                    <span className="flex items-center gap-2 text-muted-foreground"><MetricIcon className="h-4 w-4" /> {metric.label}</span>
                    <span className="font-medium">
                      {metric.value !== undefined && metric.value !== '' ? `${metric.value} ${metric.unit}` : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
             <Button variant="outline" className="w-full mt-4" disabled>
                <LucideIcons.Watch className="mr-2 h-4 w-4" /> Sync Wearable Device (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Today&apos;s AI Suggestion</CardTitle>
            <CardDescription>Based on your current stress analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[200px]">
            {isLoading && !stressAnalysis ? (
              <div className="flex items-center justify-center h-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                 <p className="ml-3 text-muted-foreground">Generating suggestions...</p>
              </div>
            ) : stressAnalysis?.primarySuggestion ? (
              <>
                <div className="p-4 rounded-lg bg-accent/50 border border-accent">
                  <div className="flex items-start gap-3">
                    {stressAnalysis.primarySuggestion.icon ? (
                        <DynamicIcon name={stressAnalysis.primarySuggestion.icon} className="h-6 w-6 text-primary mt-1" />
                    ) : (
                        <AlertCircle className="h-6 w-6 text-primary mt-1" />
                    )}
                    <div>
                      <h4 className="font-semibold">{stressAnalysis.primarySuggestion.title || "Primary Suggestion"}</h4>
                      <p className="text-sm text-muted-foreground">{stressAnalysis.primarySuggestion.text}</p>
                    </div>
                  </div>
                </div>
                {stressAnalysis.analysisSummary && (
                    <p className="text-sm text-muted-foreground italic p-2 bg-muted/20 rounded-md">
                        <strong>AI Note:</strong> {stressAnalysis.analysisSummary}
                    </p>
                )}
                {stressAnalysis.secondarySuggestions && stressAnalysis.secondarySuggestions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">More ideas:</h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {stressAnalysis.secondarySuggestions.map((sugg, index) => (
                        <li key={index}>{sugg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Log your metrics to get personalized suggestions.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Smart Alerts</CardTitle>
            <CardDescription>We&apos;ll notify you when stress rises (customization coming soon).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-md bg-muted/30">
              <span className="text-sm text-muted-foreground">Alert Threshold</span>
              <Badge variant="outline">Level 7+</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-md bg-muted/30">
              <span className="text-sm text-muted-foreground">Break Reminder</span>
              <Badge variant="outline">Every 45 min</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-md bg-muted/30">
              <span className="text-sm text-muted-foreground">Notification Type</span>
              <Badge variant="outline">Desktop + Mobile</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full" disabled>
              <Settings className="mr-2 h-4 w-4" /> Customize Alerts (Coming Soon)
            </Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
}
