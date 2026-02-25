
"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import type { Allergy, MedicalCondition, Surgery } from "../profile/page";
import { useAuth } from "@/contexts/AuthContext";

type ProfileData = {
  allergies?: Allergy[];
  conditions?: MedicalCondition[];
  surgeries?: Surgery[];
};

type ChartDataItem = {
  year: string;
  allergies: number;
  conditions: number;
  surgeries: number;
};

const categoryConfig = {
    allergies: { name: 'Allergies', color: 'hsl(var(--chart-4))' },
    conditions: { name: 'Medical Conditions', color: 'hsl(var(--chart-3))' },
    surgeries: { name: 'Surgeries', color: 'hsl(var(--chart-1))' },
};
type Category = keyof typeof categoryConfig;

export default function HistoryPage() {
    const { user, userData } = useAuth();
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [visibleCategories, setVisibleCategories] = useState<Record<Category, boolean>>({
        allergies: true,
        conditions: true,
        surgeries: true,
    });

    useEffect(() => {
        if (user && userData) {
            const profile: ProfileData = userData.profile || {};
            const countsByYear: Record<string, { allergies: number; conditions: number; surgeries: number }> = {};

            const getYear = (dateString: string | undefined) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return null;
                return date.getUTCFullYear().toString();
            };

            const incrementCount = (year: string, category: Category) => {
                if (!countsByYear[year]) {
                    countsByYear[year] = { allergies: 0, conditions: 0, surgeries: 0 };
                }
                countsByYear[year][category]++;
            };

            if (Array.isArray(profile.allergies)) {
                profile.allergies.forEach(item => {
                    const year = getYear(item.diagnosisDate);
                    if (year) incrementCount(year, 'allergies');
                });
            }

            if (Array.isArray(profile.conditions)) {
                profile.conditions.forEach(item => {
                    const year = getYear(item.diagnosisDate);
                    if (year) incrementCount(year, 'conditions');
                });
            }

            if (Array.isArray(profile.surgeries)) {
                profile.surgeries.forEach(item => {
                    const year = getYear(item.date);
                    if (year) incrementCount(year, 'surgeries');
                });
            }
            
            const processedData = Object.keys(countsByYear)
                .map(year => ({
                    year,
                    ...countsByYear[year],
                }))
                .sort((a, b) => parseInt(a.year) - parseInt(b.year));

            setChartData(processedData);
        }
    }, [user, userData]);
    
    const toggleCategory = (category: Category) => {
        setVisibleCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
              <div className="grid grid-cols-1 gap-2">
                <p className="text-sm font-bold">{`Year: ${label}`}</p>
                {payload.map((entry: any) => (
                    entry.value > 0 && (
                        <p key={entry.name} style={{ color: entry.color }} className="text-sm">
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    )
                ))}
              </div>
            </div>
          );
        }
        return null;
    };


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Health History Timeline</h2>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Diagnoses & Surgeries Over Time</CardTitle>
                    <CardDescription>
                        This chart visualizes your health events by year. Click the buttons below to toggle categories.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {chartData.length > 0 ? (
                        <>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="year" tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }} />
                                        <Legend />
                                        
                                        {Object.keys(visibleCategories).map((key) => {
                                            const categoryKey = key as Category;
                                            if (visibleCategories[categoryKey]) {
                                                return (
                                                    <Bar 
                                                        key={categoryKey}
                                                        dataKey={categoryKey} 
                                                        stackId="a" 
                                                        fill={categoryConfig[categoryKey].color}
                                                        name={categoryConfig[categoryKey].name}
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {Object.keys(categoryConfig).map(key => {
                                    const categoryKey = key as Category;
                                    return (
                                        <Button
                                            key={categoryKey}
                                            variant={visibleCategories[categoryKey] ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => toggleCategory(categoryKey)}
                                            className="capitalize"
                                        >
                                           {categoryConfig[categoryKey].name}
                                        </Button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-[350px] text-center">
                            <Activity className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No health history data found.</p>
                            <p className="text-sm text-muted-foreground">Add entries in your profile to see the timeline.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
