
"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Activity,
  Droplets,
  Footprints,
  Plus,
  Smile,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [goals, setGoals] = useState({ steps: 10000, water: 8 });
  const [todayStats, setTodayStats] = useState({ steps: 0, water: 0 });
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    if (user && userData) {
      if (userData.goals) {
        setGoals(userData.goals);
      }
      if (userData.logs) {
        const today = new Date().toISOString().split("T")[0];
        const todayLog = userData.logs.find((log: any) => log.date === today);
        if (todayLog) {
          setTodayStats({
            steps: todayLog.steps || 0,
            water: todayLog.water || 0,
          });
        }
        const moodLogs = userData.logs
          .filter((log: any) => log.mood)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setRecentMoods(moodLogs);

        const last7Days: {day: string, steps: number}[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayString = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            
            const logForDay = userData.logs.find((log: any) => log.date === dayString);
            last7Days.push({
                day: dayName,
                steps: logForDay?.steps || 0
            });
        }
        setActivityData(last7Days);
      }
    }
  }, [user, userData]);

  const stepProgress = goals.steps > 0 ? (todayStats.steps / goals.steps) * 100 : 0;
  const waterProgress = goals.water > 0 ? (todayStats.water / goals.water) * 100 : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/log">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Log Entry
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Steps</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.steps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              / {goals.steps.toLocaleString()} steps
            </p>
          </CardContent>
          <CardFooter>
            <Progress value={stepProgress} />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.water}</div>
            <p className="text-xs text-muted-foreground">
              / {goals.water} glasses
            </p>
          </CardContent>
          <CardFooter>
            <Progress value={waterProgress} />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Mood</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {recentMoods.length > 0 ? recentMoods[0].mood : "Not logged"}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentMoods.length > 0
                ? `Logged ${new Date(recentMoods[0].date).toLocaleDateString()}`
                : "No mood logged recently"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">On Track</div>
            <p className="text-xs text-muted-foreground">
              Keep up the great work!
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/goals" className="w-full">
              <Button variant="outline" size="sm" className="w-full">Set Goals</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Your step count for the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {activityData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={activityData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    />
                    <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="steps" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
                </ChartContainer>
            ) : (
                 <div className="flex h-[250px] w-full flex-col items-center justify-center text-center">
                    <Activity className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No activity logged yet.</p>
                    <p className="text-sm text-muted-foreground">Start logging your steps to see your progress here.</p>
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Mood & Symptom Logs</CardTitle>
            <CardDescription>
              A quick look at your recent entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {recentMoods.length > 0 ? (
                <div className="space-y-4">
                  {recentMoods.map((log, index) => (
                    <div key={index} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                         <p className="font-medium capitalize">{log.mood}</p>
                         <p className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.symptoms}</p>
                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {log.tags.map((tag: string, i: number) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Activity className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No recent logs found.</p>
                  <Link href="/log" className="mt-2">
                    <Button variant="outline" size="sm">Add a log</Button>
                  </Link>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
