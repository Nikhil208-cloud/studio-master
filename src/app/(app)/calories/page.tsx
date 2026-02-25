
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Flame, Plus, Trash2, PieChart as PieChartIcon, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";


type Meal = {
    name: string;
    calories: number;
    serving: string;
    protein: number;
    carbs: number;
    fat: number;
};

type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

type ProfileData = {
    age?: number;
    gender?: 'male' | 'female';
    weight?: number;
    height?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';
};

const defaultFoodDatabase: Meal[] = [
    { name: "Apple", calories: 95, serving: "1 medium", protein: 0.5, carbs: 25, fat: 0.3 },
    { name: "Banana", calories: 105, serving: "1 medium", protein: 1.3, carbs: 27, fat: 0.4 },
    { name: "Chicken Breast (100g, cooked)", calories: 165, serving: "100g", protein: 31, carbs: 0, fat: 3.6 },
    { name: "Salmon (100g, cooked)", calories: 206, serving: "100g", protein: 22, carbs: 0, fat: 12 },
    { name: "Beef Steak (100g, cooked)", calories: 271, serving: "100g", protein: 26, carbs: 0, fat: 17 },
    { name: "Tofu (100g)", calories: 76, serving: "100g", protein: 8, carbs: 1.9, fat: 4.8 },
    { name: "White Rice (1 cup, cooked)", calories: 204, serving: "1 cup", protein: 4.3, carbs: 45, fat: 0.4 },
    { name: "Brown Rice (1 cup, cooked)", calories: 216, serving: "1 cup", protein: 5, carbs: 45, fat: 1.8 },
    { name: "Whole Egg (large)", calories: 78, serving: "1 large", protein: 6, carbs: 0.6, fat: 5 },
    { name: "Avocado (half)", calories: 160, serving: "half", protein: 2, carbs: 8.5, fat: 14.7 },
    { name: "Almonds (28g)", calories: 164, serving: "28g", protein: 6, carbs: 6, fat: 14 },
    { name: "Broccoli (1 cup)", calories: 55, serving: "1 cup", protein: 3.7, carbs: 11.2, fat: 0.6 },
    { name: "Spinach (1 cup, raw)", calories: 7, serving: "1 cup", protein: 0.9, carbs: 1.1, fat: 0.1 },
    { name: "Milk (1 cup, 2%)", calories: 122, serving: "1 cup", protein: 8, carbs: 12, fat: 5 },
    { name: "Greek Yogurt (1 cup)", calories: 100, serving: "1 cup", protein: 17, carbs: 6, fat: 0 },
];


export default function CaloriesPage() {
    const { user, userData, updateUserData } = useAuth();
    const { toast } = useToast();
    const [meals, setMeals] = useState<Record<MealType, Meal[]>>({ breakfast: [], lunch: [], dinner: [], snacks: [] });
    const [isMealDialogOpen, setMealDialogOpen] = useState(false);
    const [isCustomFoodDialogOpen, setCustomFoodDialogOpen] = useState(false);
    const [activeMealType, setActiveMealType] = useState<MealType>("breakfast");
    const [searchTerm, setSearchTerm] = useState("");
    const [customFoods, setCustomFoods] = useState<Meal[]>([]);
    const [newFood, setNewFood] = useState({ name: "", calories: "", serving: "", protein: "", carbs: "", fat: "" });
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    useEffect(() => {
        if (user && userData) {
            const today = new Date().toISOString().split('T')[0];
            
            if (userData.calories && userData.calories.date === today) {
                setMeals(userData.calories.meals);
            } else {
                setMeals({ breakfast: [], lunch: [], dinner: [], snacks: [] });
            }

            if (userData.customFoods) {
                setCustomFoods(userData.customFoods);
            }

            if (userData.profile) {
                setProfileData({
                    age: Number(userData.profile.age),
                    gender: userData.profile.gender,
                    weight: Number(userData.profile.weight),
                    height: Number(userData.profile.height),
                    activityLevel: userData.profile.activityLevel
                });
            }
        }
    }, [user, userData]);

    const saveMealsToDb = (currentMeals: Record<MealType, Meal[]>) => {
        if (user) {
            const today = new Date().toISOString().split('T')[0];
            updateUserData({ calories: { date: today, meals: currentMeals } });
        }
    }

    const saveCustomFoodsToDb = (currentCustomFoods: Meal[]) => {
        if(user) {
            updateUserData({ customFoods: currentCustomFoods });
        }
    }

    const allFoods = useMemo(() => [...defaultFoodDatabase, ...customFoods].sort((a,b) => a.name.localeCompare(b.name)), [customFoods]);
    const filteredFood = allFoods.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const totalMacros = useMemo(() => {
        return Object.values(meals).flat().reduce((acc, food) => {
            acc.calories += food.calories;
            acc.protein += food.protein;
            acc.carbs += food.carbs;
            acc.fat += food.fat;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [meals]);

    const recommendedIntake = useMemo(() => {
        if (!profileData || !profileData.age || !profileData.weight || !profileData.height || !profileData.gender || !profileData.activityLevel) {
            return null;
        }
        const { age, weight, height, gender, activityLevel } = profileData;

        let bmr: number;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extra: 1.9 };
        const tdee = bmr * activityMultipliers[activityLevel];

        return {
            calories: Math.round(tdee),
            protein: Math.round((tdee * 0.30) / 4), // 30% protein
            carbs: Math.round((tdee * 0.40) / 4),   // 40% carbs
            fat: Math.round((tdee * 0.30) / 9),     // 30% fat
        };
    }, [profileData]);

    const macroPieChartData = useMemo(() => {
        const { protein, carbs, fat } = totalMacros;
        const totalCals = (protein * 4) + (carbs * 4) + (fat * 9);
        if (totalCals === 0) return [];
        return [
            { name: "Carbs", value: carbs * 4, grams: carbs },
            { name: "Protein", value: protein * 4, grams: protein },
            { name: "Fat", value: fat * 9, grams: fat },
        ];
    }, [totalMacros]);

    const PIE_COLORS = ['hsl(var(--chart-3))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))'];
    
    const handleAddFood = (food: Meal) => {
        const newMeals = {...meals, [activeMealType]: [...meals[activeMealType], food]};
        setMeals(newMeals);
        saveMealsToDb(newMeals);
        setMealDialogOpen(false);
        setSearchTerm("");
    };

    const handleRemoveFood = (mealType: MealType, index: number) => {
        const newMealTypeLog = [...meals[mealType]];
        newMealTypeLog.splice(index, 1);
        const newMeals = {...meals, [mealType]: newMealTypeLog};
        setMeals(newMeals);
        saveMealsToDb(newMeals);
    };

    const openDialogForMeal = (mealType: MealType) => {
        setActiveMealType(mealType);
        setMealDialogOpen(true);
    };

    const handleAddCustomFood = () => {
        if (!newFood.name || !newFood.calories || !newFood.serving || !newFood.protein || !newFood.carbs || !newFood.fat) {
            toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all fields for the new food."});
            return;
        }
        const foodToAdd: Meal = {
            name: newFood.name,
            calories: Number(newFood.calories),
            serving: newFood.serving,
            protein: Number(newFood.protein),
            carbs: Number(newFood.carbs),
            fat: Number(newFood.fat),
        };
        const updatedCustomFoods = [...customFoods, foodToAdd];
        setCustomFoods(updatedCustomFoods);
        saveCustomFoodsToDb(updatedCustomFoods);
        setNewFood({ name: "", calories: "", serving: "", protein: "", carbs: "", fat: "" });
        setCustomFoodDialogOpen(false);
        toast({ title: "Success", description: "New custom food has been added." });
    };

    const handleOpenCustomFoodFromSearch = () => {
        setNewFood({ name: searchTerm, calories: "", serving: "", protein: "", carbs: "", fat: "" });
        setMealDialogOpen(false);
        setCustomFoodDialogOpen(true);
        setSearchTerm("");
    };

    const handleDeleteCustomFood = (foodNameToDelete: string) => {
        const updatedCustomFoods = customFoods.filter(food => food.name !== foodNameToDelete);
        setCustomFoods(updatedCustomFoods);
        saveCustomFoodsToDb(updatedCustomFoods);
        toast({ title: "Food Removed", description: `${foodNameToDelete} has been removed from your custom list.` });
    };

    const mealSections: {key: MealType, title: string}[] = [
        { key: "breakfast", title: "Breakfast" },
        { key: "lunch", title: "Lunch" },
        { key: "dinner", title: "Dinner" },
        { key: "snacks", title: "Snacks" },
    ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Calorie & Macro Tracker</h2>
            <div className="flex items-center gap-2 text-xl font-bold">
                <Flame className="h-6 w-6 text-primary"/>
                <span>{Math.round(totalMacros.calories).toLocaleString()} <span className="text-sm text-muted-foreground font-medium">kcal</span></span>
            </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                {mealSections.map(section => (
                    <Card key={section.key}>
                        <CardHeader className="flex-row items-center justify-between">
                           <div>
                            <CardTitle>{section.title}</CardTitle>
                            <CardDescription>
                                {meals[section.key].reduce((acc, item) => acc + item.calories, 0).toLocaleString()} kcal
                            </CardDescription>
                           </div>
                           <Button size="sm" variant="outline" onClick={() => openDialogForMeal(section.key)}><Plus className="mr-2 h-4 w-4"/> Add Food</Button>
                        </CardHeader>
                        <CardContent>
                            {meals[section.key].length > 0 ? (
                                <ul className="space-y-2">
                                    {meals[section.key].map((food, index) => (
                                        <li key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-secondary">
                                            <div>
                                                <p className="font-medium">{food.name}</p>
                                                <p className="text-xs text-muted-foreground">{food.serving} &bull; P: {food.protein}g, C: {food.carbs}g, F: {food.fat}g</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{food.calories} kcal</span>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveFood(section.key, index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No items logged for {section.title.toLowerCase()}.</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <PieChartIcon className="h-5 w-5"/> Macro Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {macroPieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={macroPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {macroPieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [`${props.payload.grams.toFixed(1)}g`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-10">Log food to see macro breakdown.</p>
                        )}
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div><p className="font-bold text-lg">{totalMacros.protein.toFixed(1)}g</p><p className="text-xs text-muted-foreground">Protein</p></div>
                            <div><p className="font-bold text-lg">{totalMacros.carbs.toFixed(1)}g</p><p className="text-xs text-muted-foreground">Carbs</p></div>
                            <div><p className="font-bold text-lg">{totalMacros.fat.toFixed(1)}g</p><p className="text-xs text-muted-foreground">Fat</p></div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           Recommended Intake
                           <TooltipProvider>
                            <ShadTooltip>
                                <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                                <TooltipContent>Based on your profile data (Mifflin-St Jeor formula).</TooltipContent>
                            </ShadTooltip>
                           </TooltipProvider>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recommendedIntake ? (
                             <div className="space-y-3">
                                <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Calories</span><span className="font-bold">{recommendedIntake.calories} kcal</span></div>
                                <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Protein</span><span className="font-bold">{recommendedIntake.protein} g</span></div>
                                <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Carbs</span><span className="font-bold">{recommendedIntake.carbs} g</span></div>
                                <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Fat</span><span className="font-bold">{recommendedIntake.fat} g</span></div>
                             </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Please complete your profile to see recommendations.</p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Custom Foods</CardTitle>
                        <CardDescription>Add or remove your own food items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customFoods.length > 0 ? (
                            <ScrollArea className="h-[150px]">
                            <ul className="space-y-2 pr-4">
                                {customFoods.map((food, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-secondary">
                                        <div>
                                            <p className="font-medium">{food.name}</p>
                                            <p className="text-xs text-muted-foreground">{food.calories} kcal &bull; P:{food.protein} C:{food.carbs} F:{food.fat}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCustomFood(food.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No custom foods added yet.</p>
                        )}
                        <Button variant="outline" className="w-full mt-4" onClick={() => setCustomFoodDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4"/> Add Custom Food
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      <Dialog open={isMealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Add food to {activeMealType}</DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-4">
                <Input 
                    placeholder="Search for a food..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ScrollArea className="h-[300px] border rounded-md">
                    <div className="p-2">
                    {filteredFood.length > 0 ? (
                        <ul className="space-y-1">
                            {filteredFood.map((food, index) => (
                                <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                    <div>
                                        <p className="font-medium">{food.name}</p>
                                        <p className="text-xs text-muted-foreground">{food.calories} kcal &bull; P: {food.protein}g, C: {food.carbs}g, F: {food.fat}g</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleAddFood(food)}>Add</Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-4 space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {searchTerm ? `No results for "${searchTerm}".` : "No food found."}
                            </p>
                            {searchTerm && (
                                <Button 
                                    variant="outline" 
                                    className="mt-2"
                                    onClick={handleOpenCustomFoodFromSearch}
                                >
                                    <Plus className="mr-2 h-4 w-4"/> Add it as a new food
                                </Button>
                            )}
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomFoodDialogOpen} onOpenChange={setCustomFoodDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Add a Custom Food</DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="food-name">Food Name</Label>
                    <Input id="food-name" value={newFood.name} onChange={(e) => setNewFood({...newFood, name: e.target.value})} placeholder="e.g., My special sandwich"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="food-serving">Serving Size</Label>
                        <Input id="food-serving" value={newFood.serving} onChange={(e) => setNewFood({...newFood, serving: e.target.value})} placeholder="e.g., 1 serving"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="food-calories">Calories</Label>
                        <Input id="food-calories" type="number" value={newFood.calories} onChange={(e) => setNewFood({...newFood, calories: e.target.value})} placeholder="e.g., 350"/>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="food-protein">Protein (g)</Label>
                        <Input id="food-protein" type="number" value={newFood.protein} onChange={(e) => setNewFood({...newFood, protein: e.target.value})} placeholder="e.g., 20"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="food-carbs">Carbs (g)</Label>
                        <Input id="food-carbs" type="number" value={newFood.carbs} onChange={(e) => setNewFood({...newFood, carbs: e.target.value})} placeholder="e.g., 45"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="food-fat">Fat (g)</Label>
                        <Input id="food-fat" type="number" value={newFood.fat} onChange={(e) => setNewFood({...newFood, fat: e.target.value})} placeholder="e.g., 15"/>
                    </div>
                </div>
                <Button onClick={handleAddCustomFood} className="w-full">Add Food to Library</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
