export const summaryInsights = [
  { title: "Average HR", value: "72", unit: "BPM", trend: "+2%", isPositive: false },
  { title: "Sleep Quality", value: "85", unit: "/100", trend: "+5%", isPositive: true },
  { title: "Daily Steps", value: "11,240", unit: "Steps", trend: "+12%", isPositive: true },
  { title: "Active Calories", value: "640", unit: "kcal", trend: "-4%", isPositive: false },
];

export const activityData = [
  { time: "Mon", HR: 68, Steps: 8500, Sleep: 7.2 },
  { time: "Tue", HR: 70, Steps: 10200, Sleep: 6.8 },
  { time: "Wed", HR: 74, Steps: 12100, Sleep: 7.5 },
  { time: "Thu", HR: 72, Steps: 9800, Sleep: 7.8 },
  { time: "Fri", HR: 69, Steps: 14500, Sleep: 8.1 },
  { time: "Sat", HR: 75, Steps: 16200, Sleep: 8.5 },
  { time: "Sun", HR: 71, Steps: 8400, Sleep: 7.0 },
];

export const anomalyAlerts = [
  { id: 1, type: "heart_rate", message: "Spike at 12:45 AM (112 BPM). Check sleep quality logs.", severity: "medium", time: "2 hrs ago" },
  { id: 2, type: "activity", message: "Steps 40% below average for the last 3 days.", severity: "low", time: "5 hrs ago" },
  { id: 3, type: "sleep", message: "REM sleep ratio unusually low (<15%).", severity: "high", time: "1 day ago" },
];
