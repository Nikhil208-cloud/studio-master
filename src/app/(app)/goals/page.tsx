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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Droplets, Footprints } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function GoalsPage() {
  const { user, userData, updateUserData } = useAuth();
  const { toast } = useToast();
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [waterGoal, setWaterGoal] = useState(8);

  useEffect(() => {
    if (user && userData?.goals) {
        const { steps, water } = userData.goals;
        if (steps) setStepsGoal(steps);
        if (water) setWaterGoal(water);
    }
  }, [user, userData]);

  const handleSaveGoals = () => {
    if (user) {
      const goals = {
        steps: stepsGoal,
        water: waterGoal,
      };
      updateUserData({ goals });
      toast({
        title: "Goals Saved!",
        description: "Your new health goals have been updated.",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Set Your Goals</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Footprints className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Daily Steps</CardTitle>
                <CardDescription>
                  Set your target for daily steps.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="flex items-center justify-center space-x-4">
              <Input
                type="number"
                className="h-16 text-center text-4xl font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={stepsGoal}
                onChange={(e) => setStepsGoal(Number(e.target.value))}
                step="500"
              />
            </div>
            <div className="space-y-2">
              <Label>Adjust Goal</Label>
              <Slider
                value={[stepsGoal]}
                onValueChange={(value) => setStepsGoal(value[0])}
                max={20000}
                step={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>20,000+</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Droplets className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Daily Water Intake</CardTitle>
                <CardDescription>
                  Set your target for glasses of water.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="flex items-center justify-center space-x-4">
              <Input
                type="number"
                className="h-16 text-center text-4xl font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                max="20"
              />
            </div>
            <div className="space-y-2">
              <Label>Adjust Goal</Label>
              <Slider
                value={[waterGoal]}
                onValueChange={(value) => setWaterGoal(value[0])}
                max={20}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>20</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveGoals} size="lg">Save All Goals</Button>
      </div>
    </div>
  );
}
