
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

export default function LogPage() {
  const { user, userData, updateUserData } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Vitals State
  const [steps, setSteps] = useState("");
  const [water, setWater] = useState("");

  // Mood State
  const [mood, setMood] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Custom Metrics State
  const [customMetrics, setCustomMetrics] = useState<{ name: string; unit: string; value: string }[]>([]);
  const [definedMetrics, setDefinedMetrics] = useState<{ name: string; unit: string }[]>([]);
  const [newMetricName, setNewMetricName] = useState("");
  const [newMetricUnit, setNewMetricUnit] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Load metric definitions once
  useEffect(() => {
    if (user && userData?.definedMetrics) {
      setDefinedMetrics(userData.definedMetrics);
    }
  }, [user, userData]);

  // Load log data when date or user changes
  useEffect(() => {
    if (user && userData) {
        const logForDate = userData.logs?.find((log: any) => log.date === date);

        const newCustomMetrics = (userData.definedMetrics || []).map(metric => ({
            ...metric,
            value: logForDate?.custom?.[metric.name]?.value?.toString() || ''
        }));
        setCustomMetrics(newCustomMetrics);
        
        if (logForDate) {
            setSteps(logForDate.steps?.toString() || "");
            setWater(logForDate.water?.toString() || "");
            setMood(logForDate.mood || "");
            setSymptoms(logForDate.symptoms || "");
            setTags(logForDate.tags || []);
        } else {
            // Reset form if no log exists for the selected date
            setSteps("");
            setWater("");
            setMood("");
            setSymptoms("");
            setTags([]);
        }
    }
  }, [date, user, userData]);


  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleDefineNewMetric = () => {
    if (newMetricName && newMetricUnit && user) {
      const newMetric = { name: newMetricName, unit: newMetricUnit };
      const updatedDefinedMetrics = [...definedMetrics, newMetric];
      setDefinedMetrics(updatedDefinedMetrics);
      updateUserData({ definedMetrics: updatedDefinedMetrics });
      setNewMetricName("");
      setNewMetricUnit("");
      setDialogOpen(false);
      toast({ title: "Success", description: "New metric has been defined." });
    }
  };

  const handleDeleteDefinedMetric = (metricName: string) => {
    if(user) {
        const updatedDefinedMetrics = definedMetrics.filter(m => m.name !== metricName);
        setDefinedMetrics(updatedDefinedMetrics);
        updateUserData({ definedMetrics: updatedDefinedMetrics });
        toast({ title: "Metric Removed", description: `${metricName} has been removed.` });
    }
  }

  const handleSaveLog = () => {
    if (user && userData) {
      let logs = userData.logs || [];

      let todayLogIndex = logs.findIndex((log: any) => log.date === date);
      
      let newLogData: any = { date };

      if (steps) newLogData.steps = Number(steps);
      if (water) newLogData.water = Number(water);
      if (mood) newLogData.mood = mood;
      if (symptoms) newLogData.symptoms = symptoms;
      if (tags.length > 0) newLogData.tags = tags;
      
      const customMetricData = customMetrics
        .filter(m => m.value)
        .reduce((acc, metric) => ({...acc, [metric.name]: {value: Number(metric.value), unit: metric.unit}}), {});
      
      if (Object.keys(customMetricData).length > 0) {
          newLogData.custom = customMetricData;
      }
      
      if (todayLogIndex > -1) {
        const existingLog = logs[todayLogIndex];
        logs[todayLogIndex] = { ...existingLog, ...newLogData };
      } else {
        logs.push(newLogData);
      }

      updateUserData({ logs });
      toast({
        title: "Log Saved!",
        description: `Your health data for ${new Date(date).toLocaleDateString()} has been saved.`,
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Log Entry</h2>
        <div className="flex items-center space-x-2">
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-[180px]"/>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="mood">Mood & Symptoms</TabsTrigger>
          <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Vitals</CardTitle>
              <CardDescription>
                Log your steps and water intake for the selected day.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="steps">Steps</Label>
                <Input
                  id="steps"
                  type="number"
                  placeholder="e.g., 10000"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water">Water Intake (glasses)</Label>
                <Input
                  id="water"
                  type="number"
                  placeholder="e.g., 8"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood & Symptoms</CardTitle>
              <CardDescription>
                How are you feeling today?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mood">Overall Mood</Label>
                <Input
                  id="mood"
                  placeholder="e.g., Happy, tired, energetic"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  placeholder="e.g., Slight headache, feeling bloated..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map(t => (
                        <Badge key={t} variant="secondary" className="pl-2 pr-1">
                            {t}
                            <button onClick={() => handleRemoveTag(t)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Health Metrics</CardTitle>
              <CardDescription>Log any other health data you want to track.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customMetrics.length > 0 ? customMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`custom-${metric.name}`}>{metric.name} ({metric.unit})</Label>
                  <Input
                    id={`custom-${metric.name}`}
                    type="number"
                    placeholder={`Enter ${metric.name.toLowerCase()}`}
                    value={metric.value}
                    onChange={e => {
                        const newMetrics = [...customMetrics];
                        newMetrics[index].value = e.target.value;
                        setCustomMetrics(newMetrics);
                    }}
                  />
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">No custom metrics defined yet.</p>
              )}
               <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Define New Metric
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Define a New Metric</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="new-metric-name">Metric Name</Label>
                                <Input id="new-metric-name" value={newMetricName} onChange={e => setNewMetricName(e.target.value)} placeholder="e.g., Sleep"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="new-metric-unit">Unit</Label>
                                <Input id="new-metric-unit" value={newMetricUnit} onChange={e => setNewMetricUnit(e.target.value)} placeholder="e.g., hours"/>
                            </div>
                            <Button onClick={handleDefineNewMetric} className="w-full">Define Metric</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
          </Card>
          {definedMetrics.length > 0 && <Card>
                <CardHeader>
                    <CardTitle>Manage Defined Metrics</CardTitle>
                    <CardDescription>Remove metrics you no longer want to track.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                    {definedMetrics.map(metric => (
                        <li key={metric.name} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                           <p className="font-medium">{metric.name} <span className="text-muted-foreground">({metric.unit})</span></p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteDefinedMetric(metric.name)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </li>
                    ))}
                    </ul>
                </CardContent>
            </Card>}
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <Button onClick={handleSaveLog} size="lg">Save Log</Button>
      </div>
    </div>
  );
}
