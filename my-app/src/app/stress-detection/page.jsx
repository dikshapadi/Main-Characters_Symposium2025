"use client";

import React from "react";
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
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell, ReferenceArea, ReferenceLine
} from "recharts";

const AUTO_GENERATED_KEYS = [
  "HR", "HRV", "SpO2", "Steps", "Distance", "Calories", "ActiveTime", "SleepDuration", "SleepEfficiency"
];

const initialTrackedMetrics = [
  { key: "HR", label: "Heart Rate", defaultValue: 75, unit: "bpm", icon: HeartPulse, inputType: "number", min: 50, max: 160, placeholder: "e.g., 75" },
  { key: "HRV", label: "HRV", defaultValue: 65, unit: "ms", icon: ActivitySquare, inputType: "number", min: 15, max: 120, placeholder: "e.g., 65" },
  { key: "SpO2", label: "Oxygen Saturation", defaultValue: 98, unit: "%", icon: Droplets, inputType: "number", min: 80, max: 100, placeholder: "e.g., 98" },
  { key: "Steps", label: "Steps", defaultValue: 300, unit: "", icon: Footprints, inputType: "number", min: 0, max: 600, placeholder: "e.g., 300" },
  { key: "Distance", label: "Distance", defaultValue: 0.3, unit: "km", icon: MapPin, inputType: "number", min: 0.0, max: 1.0, step: "0.01", placeholder: "e.g., 0.3" },
  { key: "Calories", label: "Calories", defaultValue: 6, unit: "kcal", icon: Flame, inputType: "number", min: 0.0, max: 100, step: "0.1", placeholder: "e.g., 6" },
  { key: "ActiveTime", label: "Active Time", defaultValue: 2, unit: "min", icon: Timer, inputType: "number", min: 0, max: 5, placeholder: "e.g., 2" },
  { key: "SleepDuration", label: "Sleep Duration", defaultValue: 7, unit: "hours", icon: Bed, inputType: "number", min: 0, max: 9, step: "0.1", placeholder: "e.g., 7" },
  { key: "SleepEfficiency", label: "Sleep Efficiency", defaultValue: 85, unit: "%", icon: MoonStar, inputType: "number", min: 10, max: 95, placeholder: "e.g., 85" },
  { key: "Height", label: "Height", defaultValue: 170, unit: "cm", icon: Ruler, inputType: "number", min: 130, max: 190, placeholder: "e.g., 170" },
  { key: "Weight", label: "Weight", defaultValue: 65, unit: "kg", icon: Weight, inputType: "number", min: 10, max: 100, placeholder: "e.g., 65" },
  { key: "Age", label: "Age", defaultValue: 30, unit: "years", icon: User, inputType: "number", min: 1, max: 65, placeholder: "e.g., 30" },
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

// Add this helper above your component
function getNeatTicks(min, max) {
  if (!isFinite(min) || !isFinite(max)) return [];
  const range = max - min;
  let step;
  if (range <= 2) {
    step = 0.5;
  } else if (range <= 10) {
    step = 1;
  } else if (range <= 50) {
    step = 5;
  } else {
    step = 10;
  }
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = start; v <= end; v += step) {
    ticks.push(Number(v.toFixed(2)));
  }
  // Always include min and max
  if (!ticks.includes(Number(min.toFixed(2)))) ticks.unshift(Number(min.toFixed(2)));
  if (!ticks.includes(Number(max.toFixed(2)))) ticks.push(Number(max.toFixed(2)));
  return Array.from(new Set(ticks)).sort((a, b) => a - b);
}

// Helper for random integer in [min, max]
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildChartData(history, metricKey) {
  // Metrics to accumulate per day
  const accumulateKeys = ["Steps", "Distance", "Calories", "ActiveTime"];
  // Metrics to show only latest per day
  const latestPerDayKeys = ["SleepDuration", "SleepEfficiency"];
  // Metrics to show every reading
  const everyReadingKeys = ["stress", "HR", "HRV", "SpO2"];

  if (accumulateKeys.includes(metricKey)) {
    // Accumulate per day
    const map = new Map();
    history.forEach(entry => {
      if (!map.has(entry.date)) {
        map.set(entry.date, { ...entry, count: 1 });
      } else {
        const prev = map.get(entry.date);
        map.set(entry.date, {
          ...prev,
          [metricKey]: (prev[metricKey] || 0) + (entry[metricKey] || 0),
          count: prev.count + 1
        });
      }
    });
    return Array.from(map.values()).map(entry => ({
      date: entry.date,
      [metricKey]: entry[metricKey]
    }));
  } else if (latestPerDayKeys.includes(metricKey)) {
    // Only latest per day
    const map = new Map();
    history.forEach(entry => {
      map.set(entry.date, entry); // overwrite, so last one stays
    });
    return Array.from(map.values()).map(entry => ({
      date: entry.date,
      [metricKey]: entry[metricKey]
    }));
  } else if (everyReadingKeys.includes(metricKey)) {
    // Every reading
    return history.map(entry => ({
      time: entry.time, // <-- this is correct
      [metricKey]: entry[metricKey]
    }));
  } else {
    // Default: every reading
    return history.map(entry => ({
      date: entry.date,
      [metricKey]: entry[metricKey]
    }));
  }
}

// Helper to render the correct chart for each metric
function renderMetricChart({ chartType, key, color }, chartData, yMin, yMax, getNeatTicks) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(today.getDate() - 2);
  const dayBeforeYesterdayyest = new Date(today);
  dayBeforeYesterdayyest.setDate(today.getDate() - 3);
  const formatDate = (date) =>
  date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

  switch (key) {
    // 1. Heart Rate Trend Chart (add axis labels)
    case "HR":
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Time (24h)", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            domain={[50, 160]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Heart Rate (bpm)", angle: -90, position: "insideLeft" }}
          />
          <ReferenceArea y1={60} y2={100} fill="#bbf7d0" fillOpacity={0.3} />
          <Tooltip formatter={v => `${v} bpm`} />
          <Line
            type="monotone"
            dataKey="HR"
            stroke="#ef4444"
            strokeWidth={2}
            dot={({ cx, cy, value, index }) => (
              <circle
                key={cx + '-' + cy + '-' + index}
                cx={cx}
                cy={cy}
                r={5}
                fill={value > 100 ? "#ef4444" : "#22c55e"}
                stroke="#fff"
                strokeWidth={1}
              />
            )}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
          />
        </LineChart>
      );

    // 2. HRV Chart (add axis labels)
    case "HRV":
      return (
        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Time (24h)", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            domain={[15, 120]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "HRV (ms)", angle: -90, position: "insideLeft" }}
          />
          <ReferenceArea y1={15} y2={40} fill="#fee2e2" fillOpacity={0.3} />
          <ReferenceArea y1={40} y2={70} fill="#fef9c3" fillOpacity={0.3} />
          <ReferenceArea y1={70} y2={120} fill="#bbf7d0" fillOpacity={0.3} />
          <Tooltip formatter={v => `${v} ms`} />
          <Area
            type="monotone"
            dataKey="HRV"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            isAnimationActive={true}
          />
        </AreaChart>
      );

    // 3. SpO2 Chart (add axis labels)
    case "SpO2":
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Time (24h)", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            domain={[90, 100]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "SpO2 (%)", angle: -90, position: "insideLeft" }}
            tickFormatter={v => `${v}%`}
          />
          <ReferenceArea y1={95} y2={100} fill="#bbf7d0" fillOpacity={0.3} />
          <Tooltip formatter={v => `${v}%`} />
          <Line
            type="monotone"
            dataKey="SpO2"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ r: 4, fill: "#06b6d4" }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      );

    // Steps Chart (add axis labels)
    case "Steps": {
      const demoSteps = [
        { date: formatDate(dayBeforeYesterdayyest), Steps: 6450 },
        { date: formatDate(dayBeforeYesterday), Steps: 8234 },
        { date: formatDate(yesterday), Steps: 10238 },
      ];
      const existingDates = new Set(demoSteps.map(d => d.date));
      const filteredChartData = chartData.filter(d => !existingDates.has(d.date));
      const stepsChartData = [...demoSteps, ...chartData];
    
      return (
        <BarChart data={stepsChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Date", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Steps (count)", angle: -90, position: "insideLeft" }}
            tickFormatter={v => Number.isInteger(v) ? v : Number(v).toFixed(1)}
          />
          <ReferenceLine y={10000} stroke="#6366f1" strokeDasharray="4 4" label="Goal" />
          <Tooltip formatter={v => `${v} steps`} />
          <Bar dataKey="Steps" fill="#22c55e" />
        </BarChart>
      );
    }
    // Distance Chart (add axis labels)
    case "Distance":
      {
        const demoDistance = [
          { date: formatDate(dayBeforeYesterdayyest), Distance: 5.6 },
          { date: formatDate(dayBeforeYesterday), Distance: 6.2 },
          { date: formatDate(yesterday), Distance: 7.8 },
        ];
    
        const existingDates = new Set(demoDistance.map(d => d.date));
        const filteredChartData = chartData.filter(d => !existingDates.has(d.date));
        const distanceChartData = [...demoDistance, ...filteredChartData];
    
        return (
          <LineChart data={distanceChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: "Date", position: "insideBottom", offset: -10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: "Distance (km)", angle: -90, position: "insideLeft" }}
              tickFormatter={v => Number.isInteger(v) ? v : Number(v).toFixed(1)}
            />
            <Tooltip formatter={v => (Number.isInteger(v) ? v : Number(v).toFixed(1)) + " km"} />
            <Line
              type="monotone"
              dataKey="Distance"
              stroke="#f59e42"
              strokeWidth={2}
              dot={{ r: 4, fill: "#f59e42" }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        );
      }
    // 5. Sleep Duration Chart (remove median, add axis labels)
    case "SleepDuration":
      {
        const demoSleepDuration = [
          { date: formatDate(dayBeforeYesterdayyest), SleepDuration: 8 },
          { date: formatDate(dayBeforeYesterday), SleepDuration: 7.5 },
          { date: formatDate(yesterday), SleepDuration: 6.4 },
        ];
        const existingDates = new Set(demoSleepDuration.map(d => d.date));
        const filteredChartData = chartData.filter(d => !existingDates.has(d.date));
        const sleepDurationChartData = [...demoSleepDuration, ...filteredChartData];
      
      return (
        <BarChart data={sleepDurationChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Date", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Sleep Duration (hrs)", angle: -90, position: "insideLeft" }}
            tickFormatter={v => Number.isInteger(v) ? v : Number(v).toFixed(1)}
          />
          <Tooltip formatter={v => `${v} hrs`} />
          <Bar dataKey="SleepDuration" fill="#0ea5e9" />
        </BarChart>
      );
    }
    // 6. Sleep Efficiency vs. Duration Chart
    case "SleepEfficiency":
      return <div className="text-muted-foreground text-center w-full">Sleep Efficiency Trends chart is temporarily disabled.</div>;

    // Stress Chart (add axis labels)
    case "stress":
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Time (24h)", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            domain={[1, 3]}
            ticks={[1, 2, 3]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Stress Level", angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={v => `Level ${v}`} />
          <Line
            type="monotone"
            dataKey="stress"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      );

    // Active Time Trends (y: mins, x: date)
    case "ActiveTime":
      {
        const demoActiveTime = [
          { date: formatDate(dayBeforeYesterdayyest), ActiveTime: 98 },
          { date: formatDate(dayBeforeYesterday), ActiveTime: 90 },
          { date: formatDate(yesterday), ActiveTime: 110 },
        ];
        const existingDates = new Set(demoActiveTime.map(d => d.date));
        const filteredChartData = chartData.filter(d => !existingDates.has(d.date));
        const activeTimeChartData = [...demoActiveTime, ...filteredChartData];
      

      return (
        <LineChart data={activeTimeChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Date", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Time (mins)", angle: -90, position: "insideLeft" }}
            tickFormatter={v => Number.isInteger(v) ? v : Number(v).toFixed(1)}
          />
          <Tooltip formatter={v => `${v} mins`} />
          <Line
            type="monotone"
            dataKey="ActiveTime"
            stroke="#a21caf"
            strokeWidth={2}
            dot={{ r: 4, fill: "#a21caf" }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      );
    }
    // Calories Trends (BarChart, y: kcal, x: date)
    case "Calories":
      {
        const demoCalories = [
          { date: formatDate(dayBeforeYesterdayyest), Calories: 380 },
          { date: formatDate(dayBeforeYesterday), Calories: 410 },
          { date: formatDate(yesterday), Calories: 525 },
        ];
        const existingDates = new Set(demoCalories.map(d => d.date));
        const filteredChartData = chartData.filter(d => !existingDates.has(d.date));
        const caloriesChartData = [...demoCalories, ...filteredChartData];
      
      return (
        <BarChart data={caloriesChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Date", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Calories (kcal)", angle: -90, position: "insideLeft" }}
            tickFormatter={v => Number.isInteger(v) ? v : Number(v).toFixed(1)}
          />
          <Tooltip formatter={v => `${v} kcal`} />
          <Bar dataKey="Calories" fill="#fbbf24" />
        </BarChart>
      );
    }
    // Default fallback
    default:
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis domain={[yMin, yMax]} allowDecimals={true} stroke="hsl(var(--muted-foreground))" fontSize={12} ticks={getNeatTicks(yMin, yMax)} />
          <Tooltip />
          <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} isAnimationActive={true} />
        </LineChart>
      );
  }
}

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

const getStressIcon = (level) => {
  if (level === 1) return <Smile className="h-5 w-5 text-green-500" />;
  if (level === 2) return <Meh className="h-5 w-5 text-yellow-500" />;
  if (level === 3) return <Frown className="h-5 w-5 text-red-500" />;
  return <Meh className="h-5 w-5" />;
};

export default function StressDetectionPage() {
  const [currentMetricValues, setCurrentMetricValues] = useState({});
  const [displayedMetricsInStatus, setDisplayedMetricsInStatus] = useState({});
  const [isSynced, setIsSynced] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [stressAnalysis, setStressAnalysis] = useState(null);
  const [stressHistory, setStressHistory] = useState([]);
  const { toast } = useToast();

  const metricChartKeys = [
  { key: "stress", label: "Stress", color: "hsl(var(--primary))", icon: Frown, yDomain: [1, 3], yTicks: [1, 2, 3],chartType: "line", description: "Your stress levels over time (1 = Low Stress, 3 = High Stress)." },
    { key: "HR", label: "Heart Rate", color: "#ef4444", icon: HeartPulse, chartType: "line", description: "Heart Rate over time." },
    { key: "HRV", label: "HRV", color: "#6366f1", icon: ActivitySquare, chartType: "area", description: "HRV over time." },
    { key: "SpO2", label: "Oxygen Saturation", color: "#06b6d4", icon: Droplets, chartType: "bar", description: "Oxygen Saturation over time." },
    { key: "Steps", label: "Steps", color: "#22c55e", icon: Footprints, chartType: "bar", description: "Steps over time." },
    { key: "Distance", label: "Distance", color: "#f59e42", icon: MapPin, chartType: "composed", description: "Distance over time." },
    { key: "Calories", label: "Calories", color: "#fbbf24", icon: Flame, chartType: "bar", description: "Calories over time." },
    { key: "ActiveTime", label: "Active Time", color: "#a21caf", icon: Timer, chartType: "heatmap", description: "Active Time over time." },
    { key: "SleepDuration", label: "Sleep Duration", color: "#0ea5e9", icon: Bed, chartType: "histogram", description: "Sleep Duration over time." },
    // ...etc
  ];

  const [metricChartIndex, setMetricChartIndex] = useState(0);

  const handlePrevChart = () => setMetricChartIndex(i => (i === 0 ? metricChartKeys.length - 1 : i - 1));
  const handleNextChart = () => setMetricChartIndex(i => (i === metricChartKeys.length - 1 ? 0 : i + 1));

  // Prepare chart data for each metric (using stressHistory dates and currentMetricValues for demo)
  const currentMetricKey = metricChartKeys[metricChartIndex].key;
  const chartData = buildChartData(stressHistory, currentMetricKey);

  // Get all values for the current metric
  const metricValues = chartData
    .map(d => d[currentMetricKey])
    .filter(v => typeof v === "number" && !isNaN(v));

  // Compute min/max with some padding
  let yMin = Math.min(...metricValues);
  let yMax = Math.max(...metricValues);

  if (yMin === yMax) {
    // If all values are the same, add a small range for better display
    yMin = yMin - 1;
    yMax = yMax + 1;
  } else {
    // Add 5% padding
    const padding = (yMax - yMin) * 0.05;
    yMin = yMin - padding;
    yMax = yMax + padding;
  }

  useEffect(() => {
    const storedHistory = localStorage.getItem("stressHistory");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        // Validate that each entry has all required fields
        if (
          Array.isArray(parsedHistory) &&
          parsedHistory.every(item =>
            typeof item.date === 'string' &&
            typeof item.stress === 'number' &&
            ["HR","HRV","SpO2","Steps","Distance","Calories","ActiveTime","SleepDuration","SleepEfficiency"]
              .every(key => typeof item[key] === 'number')
          )
        ) {
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

  useEffect(() => {
    function getRandomValue(metric) {
      if (metric.key === "Context") {
        const opts = ["Sleep", "Home", "Work", "Commute", "Exercise", "Social"];
        return opts[Math.floor(Math.random() * opts.length)];
      }
      if (["HR", "HRV", "SpO2", "ActiveTime", "SleepDuration", "SleepEfficiency"].includes(metric.key)) {
        const min = metric.min;
        const max = metric.max;
        const step = metric.step ? parseFloat(metric.step) : 1;
        const rand = Math.random();
        let value = min + rand * (max - min);
        value = Math.round(value / step) * step;
        if (step >= 1) value = Math.round(value);
        if (step < 1) value = Number(value.toFixed(step === 0.01 ? 2 : 1));
        return value;
      }
      // For all other keys, use current user input
      return currentMetricValues[metric.key] ?? metric.defaultValue;
    }

    async function simulateAndAnalyze() {

      const simulated = {};
      // Copy user input for non-generated fields
      initialTrackedMetrics.forEach(metric => {
        if (
          [
            "Height", "Weight", "Age", "Sex", "DrinkingHabits",
            "SmokingHabits", "PastMedicalHistory", "Depression"
          ].includes(metric.key)
        ) {
          simulated[metric.key] = currentMetricValues[metric.key] ?? metric.defaultValue;
        } else if (metric.key !== "Steps" && metric.key !== "Calories" && metric.key !== "Distance") {
          simulated[metric.key] = getRandomValue(metric);
        }
      });

      // Generate context first
      simulated.Context = getRandomValue({ key: "Context", options: ["Sleep", "Home", "Work", "Commute", "Exercise", "Social"] });

      // Scenario-based HR, HRV, SpO2 logic
      let hr, hrv, spo2;
      const scenario = simulated.Context;
      const rand = Math.random();
      if (scenario === "Sleep") {
        hr = getRandomInt(50, 70);
        hrv = getRandomInt(70, 100);
        spo2 = getRandomInt(95, 100);
        if (rand < 0.05) {
          hr = getRandomInt(30, 90);
          hrv = getRandomInt(20, 40);
          spo2 = getRandomInt(85, 90);
        }
      } else if (scenario === "Home") {
        hr = getRandomInt(60, 80);
        hrv = getRandomInt(50, 80);
        spo2 = getRandomInt(95, 100);
        if (rand < 0.05) {
          hr = getRandomInt(40, 100);
          hrv = getRandomInt(20, 40);
          spo2 = getRandomInt(90, 94);
        }
      } else if (scenario === "Work") {
        hr = getRandomInt(70, 100);
        hrv = getRandomInt(40, 70);
        spo2 = getRandomInt(95, 100);
        if (rand < 0.05) {
          hr = getRandomInt(60, 110);
          hrv = getRandomInt(20, 40);
          spo2 = getRandomInt(90, 94);
        }
      } else if (scenario === "Commute") {
        hr = getRandomInt(80, 110);
        hrv = getRandomInt(30, 50);
        spo2 = getRandomInt(94, 98);
        if (rand < 0.05) {
          hr = getRandomInt(70, 120);
          hrv = getRandomInt(20, 40);
          spo2 = getRandomInt(80, 94);
        }
      } else if (scenario === "Exercise") {
        hr = getRandomInt(130, 159);
        hrv = getRandomInt(19, 30);
        spo2 = getRandomInt(90, 94);
        if (rand < 0.05) {
          hr = getRandomInt(110, 150);
          hrv = getRandomInt(20, 40);
          spo2 = getRandomInt(85, 90);
        }
      } else if (scenario === "Social") {
        hr = getRandomInt(70, 100);
        hrv = getRandomInt(40, 60);
        spo2 = getRandomInt(95, 100);
        if (rand < 0.05) {
          hr = getRandomInt(60, 110);
          hrv = getRandomInt(20, 40);
          spo2 = getRandomInt(90, 94);
        }
      } else {
        hr = getRandomInt(60, 80);
        hrv = getRandomInt(50, 80);
        spo2 = getRandomInt(95, 100);
      }
      simulated.HR = hr;
      simulated.HRV = hrv;
      simulated.SpO2 = spo2;

      // Context-based logic
      if (["Sleep", "Commute"].includes(simulated.Context)) {
        simulated.Steps = 0;
        simulated.Distance = 0;
        simulated.ActiveTime = 0;
        simulated.Calories = 0;
      } else if (["Home", "Work"].includes(simulated.Context)) {
        // Very low activity
        simulated.ActiveTime = Math.round(Math.random()); // 0 or 1 min
        const height_cm = Number(simulated.Height);
        simulated.Steps = Math.round(Math.random() * 10); // 0–10 steps
        const step_length = height_cm * 0.413 * 0.01;
        const distance_m = simulated.Steps * step_length;
        simulated.Distance = Number((distance_m / 1000).toFixed(2)); // 0–0.01 km approx

        // Calories calculation (may be zero if ActiveTime is zero)
        if (simulated.ActiveTime === 0 || simulated.Steps === 0) {
          simulated.Calories = 0;
        } else {
          const age = Number(simulated.Age);
          const weight = Number(simulated.Weight);
          const hr = Number(simulated.HR);
          const activeTime = Number(simulated.ActiveTime);
          let caloriesPerMin = 0;
          if (simulated.Sex === "Female") {
            caloriesPerMin = ((age * 0.074) - (weight * 0.05741) + (hr * 0.4472) - 20.4022) / 4.184;
          } else if (simulated.Sex === "Male") {
            caloriesPerMin = ((age * 0.2017) + (weight * 0.09036) + (hr * 0.6309) - 55.0969) / 4.184;
          } else {
            caloriesPerMin = ((age * 0.13785) + (weight * 0.016475) + (hr * 0.53905) - 37.74955) / 4.184;
          }
          let totalCalories = caloriesPerMin * activeTime;
          totalCalories = Math.max(0, Number(totalCalories.toFixed(2)));
          simulated.Calories = totalCalories;
        }
      } else {
        // Normal activity simulation
        simulated.ActiveTime = getRandomValue(initialTrackedMetrics.find(m => m.key === "ActiveTime"));
        // Generate Distance randomly
        const minDist = initialTrackedMetrics.find(m => m.key === "Distance").min;
        const maxDist = initialTrackedMetrics.find(m => m.key === "Distance").max;
        const stepDist = initialTrackedMetrics.find(m => m.key === "Distance").step ? parseFloat(initialTrackedMetrics.find(m => m.key === "Distance").step) : 0.01;
        let distance_km = minDist + Math.random() * (maxDist - minDist);
        distance_km = Math.round(distance_km / stepDist) * stepDist;
        distance_km = Number(distance_km.toFixed(2));
        simulated.Distance = distance_km;

        // Calculate Steps using the formula
        const height_cm = Number(simulated.Height);
        const distance_m = distance_km * 1000;
        const step_length = height_cm * 0.413 * 0.01;
        const step_count = Math.round(distance_m / step_length);
        simulated.Steps = step_count;

        // Calories calculation
        if (
          Number(simulated.Steps) === 0 ||
          Number(simulated.Distance) === 0 ||
          Number(simulated.ActiveTime) === 0
        ) {
          simulated.Calories = 0;
        } else {
          const age = Number(simulated.Age);
          const weight = Number(simulated.Weight);
          const hr = Number(simulated.HR);
          const activeTime = Number(simulated.ActiveTime);
          let caloriesPerMin = 0;
          if (simulated.Sex === "Female") {
            caloriesPerMin = ((age * 0.074) - (weight * 0.05741) + (hr * 0.4472) - 20.4022) / 4.184;
          } else if (simulated.Sex === "Male") {
            caloriesPerMin = ((age * 0.2017) + (weight * 0.09036) + (hr * 0.6309) - 55.0969) / 4.184;
          } else {
            caloriesPerMin = ((age * 0.13785) + (weight * 0.016475) + (hr * 0.53905) - 37.74955) / 4.184;
          }
          let totalCalories = caloriesPerMin * activeTime;
          totalCalories = Math.max(0, Number(totalCalories.toFixed(2)));
          simulated.Calories = totalCalories;
        }
      }

      setCurrentMetricValues(simulated);
    }

    if (!isSynced) return;

    simulateAndAnalyze();
    const interval = setInterval(simulateAndAnalyze, 60 * 1000); // every 1 minute

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isSynced, currentMetricValues.Height, currentMetricValues.Weight, currentMetricValues.Age, currentMetricValues.Sex, currentMetricValues.DrinkingHabits, currentMetricValues.SmokingHabits, currentMetricValues.PastMedicalHistory, currentMetricValues.Depression]);

  useEffect(() => {
    // Only run if all values are present (not empty)
    if (
      Object.keys(currentMetricValues).length === initialTrackedMetrics.length &&
      Object.values(currentMetricValues).every(v => v !== undefined && v !== null && v !== "")
    ) {
      handleUpdateMetrics();
    }
    // eslint-disable-next-line
  }, [currentMetricValues]);

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
    PastMedicalHistory: currentMetricValues.PastMedicalHistory === "" ? "None" : currentMetricValues.PastMedicalHistory,
    Depression: currentMetricValues.Depression,
    Context: currentMetricValues.Context
  };

  // Only display selected metrics in "Current Status"
  const accumulateKeys = ["Steps", "Distance", "Calories", "ActiveTime"];
  const latestPerDayKeys = ["SleepDuration", "SleepEfficiency"];
  const everyReadingKeys = ["stress", "HR", "HRV", "SpO2"];

  const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  // Include the just-entered value as a new entry for today
  const todayEntries = [
    ...stressHistory.filter(e => e.date === today),
    {
      ...currentMetricValues,
      date: today,
    }
  ];

  const newDisplayedMetrics = {};

  initialTrackedMetrics.forEach(metric => {
    if (displayedMetricKeys.includes(metric.key)) {
      let value;
      if (accumulateKeys.includes(metric.key)) {
        // Sum all today's values including the just-entered value
        value = todayEntries.reduce((sum, entry) => sum + (Number(entry[metric.key]) || 0), 0);
      } else if (latestPerDayKeys.includes(metric.key)) {
        // Latest value for today (from todayEntries, so includes just-entered value)
        value = todayEntries.length > 0 ? todayEntries[todayEntries.length - 1][metric.key] : currentMetricValues[metric.key];
      } else if (everyReadingKeys.includes(metric.key)) {
        // Latest value for today (from todayEntries, so includes just-entered value)
        value = todayEntries.length > 0 ? todayEntries[todayEntries.length - 1][metric.key] : currentMetricValues[metric.key];
      } else {
        // Fallback: use current input value
        value = currentMetricValues[metric.key];
      }
      newDisplayedMetrics[metric.key] = {
        value,
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

    const now = new Date();
    const newHistoryEntry = {
      date: now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }), // "14:05"
      stress: result.stressLevel,
      HR: Number(currentMetricValues.HR),
      HRV: Number(currentMetricValues.HRV),
      SpO2: Number(currentMetricValues.SpO2),
      Steps: Number(currentMetricValues.Steps),
      Distance: Number(currentMetricValues.Distance),
      Calories: Number(currentMetricValues.Calories),
      ActiveTime: Number(currentMetricValues.ActiveTime),
      SleepDuration: Number(currentMetricValues.SleepDuration),
      SleepEfficiency: Number(currentMetricValues.SleepEfficiency),
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
    // toast({
    //   title: "Analysis Error",
    //   description: error.message || "Could not analyze stress. Please ensure the server is running and try again.",
    //   variant: "destructive",
    // });
  } finally {
    setIsLoading(false);
  }
};

  const getStressBadgeVariant = (category) => {
    if (!category) return "secondary";
    switch (category.toLowerCase()) {
      case "low":
        return "success";      // green
      case "medium":
      case "moderate":
        return "warning";      // yellow
      case "high":
        return "destructive";  // red
      default:
        return "outline";
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Stress Detection</h1>
        <p className="text-muted-foreground">Analyze your health metrics to understand and manage your stress levels.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardEdit className="h-5 w-5 text-primary" /> Log Your Metrics
            </CardTitle>
            <CardDescription>
              Enter your latest health data to update the analysis and get insights.
            </CardDescription>
          </div>
          <Button
            variant="default"
            className="ml-2 w-full md:w-auto"
            onClick={() => setIsSynced((prev) => !prev)}
          >
            <LucideIcons.Watch className="mr-2 h-4 w-4" />
            {isSynced ? "Unsync Wearable Device" : "Sync Wearable Device"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialTrackedMetrics.map((metric) => {
              const MetricIcon = metric.icon;
              const isAuto = AUTO_GENERATED_KEYS.includes(metric.key);
              // If synced, skip rendering auto-generated fields
              if (isSynced && isAuto) return null;
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
                      disabled={isSynced && isAuto}
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
                      disabled={isSynced && isAuto}
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
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trends Carousel Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {metricChartKeys[metricChartIndex].icon && (
                  <span className="h-5 w-5 text-primary flex items-center">
                    {React.createElement(metricChartKeys[metricChartIndex].icon, { className: "h-5 w-5 text-primary" })}
                  </span>
                )}
                {metricChartKeys[metricChartIndex].label} Trends
              </CardTitle>
              <CardDescription>
                {metricChartKeys[metricChartIndex].description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevChart}>Prev</Button>
              <Button variant="outline" size="sm" onClick={handleNextChart}>Next</Button>
              <Button variant="outline" size="sm" onClick={() => { toast({ title: "Chart refreshed (placeholder)" }) }}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[320px] w-full p-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="98%" height={260}>
                {renderMetricChart(metricChartKeys[metricChartIndex], chartData, yMin, yMax, getNeatTicks)}
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-muted-foreground">Log your metrics to see {metricChartKeys[metricChartIndex].label.toLowerCase()} trends.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Current Status</CardTitle>
              <CardDescription>Based on your latest logged metrics.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => { toast({ title: "Chart refreshed (placeholder)" }) }}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
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
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">Update metrics for current stress status.</p>
            )}
            <div className="space-y-2">
              {Object.entries(displayedMetricsInStatus).map(([key, metric]) => {
                const MetricIcon = metric.icon;
                // Round value to 1 decimal if it's a number
                let displayValue = metric.value;
                if (typeof displayValue === "number" && !isNaN(displayValue)) {
                  displayValue = Number.isInteger(displayValue)
                    ? displayValue
                    : Number(displayValue.toFixed(1));
                }
                return (
                  <div key={key} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
                    <span className="flex items-center gap-2 text-muted-foreground"><MetricIcon className="h-4 w-4" /> {metric.label}</span>
                    <span className="font-medium">
                      {displayValue !== undefined && displayValue !== '' ? `${displayValue} ${metric.unit}` : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* <Button variant="outline" className="w-full mt-4" disabled>
              <LucideIcons.Watch className="mr-2 h-4 w-4" /> Sync Wearable Device
            </Button> */}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
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
            {(stressAnalysis?.stressCategory === "High" || stressAnalysis?.stressCategory === "Medium") && (
              <Button asChild className="mt-4 w-full">
                <a href="/ai-therapist">Talk to your AI therapist</a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
