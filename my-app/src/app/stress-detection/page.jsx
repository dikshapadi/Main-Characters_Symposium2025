
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  HeartPulse, Thermometer, User, Activity, Zap, BarChart3, Brain, AlertCircle, Bell, Settings, RefreshCw, TrendingUp, ClipboardEdit, Smile, Meh, Frown
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeStressAndSuggest } from "@/ai/flows/stress-analysis-flow";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const initialTrackedMetrics = [
  { key: "hrv", label: "HRV", defaultValue: 65, unit: "ms", icon: HeartPulse, inputType: "number", placeholder: "e.g., 65" },
  { key: "temperature", label: "Temperature", defaultValue: 36.5, unit: "°C", icon: Thermometer, inputType: "number", step: "0.1", placeholder: "e.g., 36.5" },
  { key: "age", label: "Age", defaultValue: 30, unit: "years", icon: User, inputType: "number", placeholder: "e.g., 30" },
  { key: "bloodPressureSystolic", label: "Systolic BP", defaultValue: 120, unit: "mmHg", icon: Activity, inputType: "number", placeholder: "e.g., 120" },
  { key: "bloodPressureDiastolic", label: "Diastolic BP", defaultValue: 80, unit: "mmHg", icon: Activity, inputType: "number", placeholder: "e.g., 80" },
  { key: "oxygenSaturation", label: "Oxygen Saturation", defaultValue: 98, unit: "%", icon: Zap, inputType: "number", placeholder: "e.g., 98" },
  { key: "sleepHours", label: "Sleep Last 24h", defaultValue: 7, unit: "hours", icon: LucideIcons.Bed, inputType: "number", step: "0.5", placeholder: "e.g., 7" },
  { key: "activityLevel", label: "Activity Level", defaultValue: "moderate", unit: "", icon: LucideIcons.Footprints, inputType: "select", options: ["sedentary", "light", "moderate", "high"] },
];

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = LucideIcons[name];
  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />; // Default icon
  }
  return <IconComponent {...props} />;
};


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
    
    // Initialize displayedMetricsInStatus with default values
    const initialDisplayMetrics = {};
    initialTrackedMetrics.forEach(metric => {
        initialDisplayMetrics[metric.key] = { value: metric.defaultValue, unit: metric.unit, label: metric.label, icon: metric.icon };
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
    setStressAnalysis(null); // Clear previous analysis

    const metricsForAI = {
      hrv: Number(currentMetricValues.hrv),
      temperature: Number(currentMetricValues.temperature),
      age: Number(currentMetricValues.age),
      bloodPressureSystolic: Number(currentMetricValues.bloodPressureSystolic),
      bloodPressureDiastolic: Number(currentMetricValues.bloodPressureDiastolic),
      oxygenSaturation: Number(currentMetricValues.oxygenSaturation),
      sleepHours: Number(currentMetricValues.sleepHours),
      activityLevel: currentMetricValues.activityLevel,
    };
    
    // Update displayed metrics for the "Current Status" card
    const newDisplayedMetrics = {};
    initialTrackedMetrics.forEach(metric => {
        newDisplayedMetrics[metric.key] = { 
            value: currentMetricValues[metric.key], 
            unit: metric.unit, 
            label: metric.label,
            icon: metric.icon
        };
    });
    setDisplayedMetricsInStatus(newDisplayedMetrics);


    try {
      const result = await analyzeStressAndSuggest(metricsForAI);
      setStressAnalysis(result);

      const today = new Date();
      const newHistoryEntry = {
        date: today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }), // Format as M/D
        stress: result.stressLevel,
      };
      
      // Add new entry and keep last 14 entries
      setStressHistory(prevHistory => {
        const updatedHistory = [...prevHistory, newHistoryEntry];
        return updatedHistory.slice(-14); 
      });

      toast({
        title: "Stress Analysis Complete",
        description: result.stressCategory ? `Your estimated stress level is ${result.stressCategory}.` : "Analysis updated.",
      });
    } catch (error) {
      console.error("Stress analysis error:", error);
      toast({
        title: "Analysis Error",
        description: error.message || "Could not analyze stress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStressBadgeVariant = (category) => {
    if (!category) return "secondary";
    switch (category.toLowerCase()) {
      case "low": return "default"; // Using primary for low stress as positive
      case "moderate": return "secondary"; // Yellowish
      case "high": return "destructive"; // Reddish
      case "extreme": return "destructive";
      default: return "outline";
    }
  };
  
  const getStressIcon = (level) => {
    if (level === null || level === undefined) return <Meh className="h-5 w-5" />;
    if (level <= 3) return <Smile className="h-5 w-5 text-green-500" />;
    if (level <= 6) return <Meh className="h-5 w-5 text-yellow-500" />;
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
              <CardDescription>Your stress levels over the past two weeks (0 = No Stress, 10 = Extreme Stress).</CardDescription>
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
                  <YAxis domain={[0, 10]} allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                {stressAnalysis.stressLevel !== null && <p className="text-sm text-muted-foreground mt-1">Score: {stressAnalysis.stressLevel}/10</p>}
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
