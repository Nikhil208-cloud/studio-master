
"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Heart, Weight, Trash2, Plus, Pencil, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ScalpelIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.18 2.82a1 1 0 0 0-1.42 0l-3.32 3.32-1.41-1.41 3.32-3.32a1 1 0 0 0 0-1.42 1 1 0 0 0-1.42 0L14.5 2.5 2.5 14.5l-1.42-1.42a1 1 0 0 0-1.42 0 1 1 0 0 0 0 1.42l3.54 3.54a1 1 0 0 0 1.42 0L18 4.5l1.41 1.41-3.32 3.32a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l3.32-3.32a1 1 0 0 0 0-1.42Z"/><path d="m18 11-1-1"/></svg>
);

const AllergyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.2 2.2c-2.3.9-4 2.9-4.7 5.3-.2.8-.2 1.7 0 2.5.7 2.4 2.4 4.4 4.7 5.3.8.3 1.7.3 2.5 0 2.3-.9 4-2.9 4.7-5.3.2-.8.2-1.7 0-2.5-.7-2.4-2.4-4.4-4.7-5.3-.8-.3-1.7-.3-2.5 0Z"/><path d="M12 18.5c-2.3.9-4.2 2.9-4.8 5.3M16.5 16a6.5 6.5 0 1 0-7-7"/><path d="M12 12.5c-2.3.9-4.2 2.9-4.8 5.3M7.5 16a6.5 6.5 0 1 1 7-7"/></svg>
);

export type Allergy = {
  id: string;
  name: string;
  severity: string;
  thingsToAvoid: string;
  diagnosisDate: string;
  endDate: string;
  document?: string;
  documentName?: string;
};

export type MedicalCondition = {
  id: string;
  name: string;
  notes: string;
  diagnosisDate: string;
  endDate: string;
  document?: string;
  documentName?: string;
};

export type Surgery = {
  id: string;
  name: string;
  date: string;
  precautions: string;
  document?: string;
  documentName?: string;
};

const emptyAllergy = { name: "", severity: "", thingsToAvoid: "", diagnosisDate: "", endDate: "", document: "", documentName: "" };
const emptyCondition = { name: "", notes: "", diagnosisDate: "", endDate: "", document: "", documentName: "" };
const emptySurgery = { name: "", date: "", precautions: "", document: "", documentName: "" };

export default function ProfilePage() {
  const { user, userData, updateUserData } = useAuth();
  const { toast } = useToast();
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  
  const [biometrics, setBiometrics] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "sedentary",
    profilePic: "",
  });

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  
  const [isAllergyDialogOpen, setAllergyDialogOpen] = useState(false);
  const [currentAllergy, setCurrentAllergy] = useState<Partial<Allergy>>(emptyAllergy);
  const [editingAllergyId, setEditingAllergyId] = useState<string | null>(null);

  const [isConditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [currentCondition, setCurrentCondition] = useState<Partial<MedicalCondition>>(emptyCondition);
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null);
  
  const [isSurgeryDialogOpen, setSurgeryDialogOpen] = useState(false);
  const [currentSurgery, setCurrentSurgery] = useState<Partial<Surgery>>(emptySurgery);
  const [editingSurgeryId, setEditingSurgeryId] = useState<string | null>(null);


  useEffect(() => {
    if (user && userData?.profile) {
        const { profile } = userData;
        setBiometrics({
            age: profile.age || "",
            gender: profile.gender || "male",
            weight: profile.weight || "",
            height: profile.height || "",
            activityLevel: profile.activityLevel || "sedentary",
            profilePic: profile.profilePic || "",
        });
        setAllergies(Array.isArray(profile.allergies) ? profile.allergies : []);
        setConditions(Array.isArray(profile.conditions) ? profile.conditions : []);
        setSurgeries(Array.isArray(profile.surgeries) ? profile.surgeries : []);
    }
  }, [user, userData]);

  const handleBiometricChange = (field: keyof typeof biometrics, value: string) => {
    setBiometrics((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: 'destructive', title: "File too large", description: "Please upload an image smaller than 2MB."});
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: "Invalid file type", description: "Please select an image."});
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
          handleBiometricChange('profilePic', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<any>>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: "File too large", description: "Please upload a file smaller than 5MB."});
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
          setter(prev => ({
              ...prev,
              document: event.target?.result as string,
              documentName: file.name
          }));
      };
      reader.onerror = () => {
        toast({ variant: 'destructive', title: "Error reading file", description: "Could not read the selected file."});
      }
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveDocument = (setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter((prev: any) => ({
        ...prev,
        document: '',
        documentName: '',
    }));
  };

  const handleOpenAddDialog = (type: 'allergy' | 'condition' | 'surgery') => {
    if (type === 'allergy') {
      setEditingAllergyId(null);
      setCurrentAllergy(emptyAllergy);
      setAllergyDialogOpen(true);
    } else if (type === 'condition') {
      setEditingConditionId(null);
      setCurrentCondition(emptyCondition);
      setConditionDialogOpen(true);
    } else {
      setEditingSurgeryId(null);
      setCurrentSurgery(emptySurgery);
      setSurgeryDialogOpen(true);
    }
  };
  
  const handleOpenEditDialog = (item: Allergy | MedicalCondition | Surgery, type: 'allergy' | 'condition' | 'surgery') => {
      if (type === 'allergy') {
          setEditingAllergyId(item.id);
          setCurrentAllergy(item as Allergy);
          setAllergyDialogOpen(true);
      } else if (type === 'condition') {
          setEditingConditionId(item.id);
          setCurrentCondition(item as MedicalCondition);
          setConditionDialogOpen(true);
      } else {
          setEditingSurgeryId(item.id);
          setCurrentSurgery(item as Surgery);
          setSurgeryDialogOpen(true);
      }
  };
  
  const handleSaveAllergy = () => {
    if (!currentAllergy.name || !currentAllergy.diagnosisDate) {
        toast({ variant: 'destructive', title: "Missing Fields", description: "Please enter at least an allergy name and diagnosis date."});
        return;
    }
    if (editingAllergyId) {
        setAllergies(allergies.map(a => a.id === editingAllergyId ? { ...a, ...currentAllergy } as Allergy : a));
        toast({ title: "Success", description: "Allergy has been updated." });
    } else {
        const allergyToAdd: Allergy = { id: new Date().toISOString() + Math.random(), ...currentAllergy } as Allergy;
        setAllergies([...allergies, allergyToAdd]);
        toast({ title: "Success", description: "Allergy has been added." });
    }
    setAllergyDialogOpen(false);
  };

  const handleRemoveAllergy = (id: string) => { setAllergies(allergies.filter(a => a.id !== id)); toast({ title: "Allergy Removed" }); };
  
  const handleSaveCondition = () => {
    if (!currentCondition.name || !currentCondition.diagnosisDate) {
        toast({ variant: 'destructive', title: "Missing Fields", description: "Please enter at least a condition name and diagnosis date."});
        return;
    }
    if (editingConditionId) {
        setConditions(conditions.map(c => c.id === editingConditionId ? { ...c, ...currentCondition } as MedicalCondition : c));
        toast({ title: "Success", description: "Condition has been updated." });
    } else {
        const conditionToAdd: MedicalCondition = { id: new Date().toISOString() + Math.random(), ...currentCondition } as MedicalCondition;
        setConditions([...conditions, conditionToAdd]);
        toast({ title: "Success", description: "Medical condition has been added." });
    }
    setConditionDialogOpen(false);
  };
  
  const handleRemoveCondition = (id: string) => { setConditions(conditions.filter(c => c.id !== id)); toast({ title: "Condition Removed" }); };

  const handleSaveSurgery = () => {
    if (!currentSurgery.name || !currentSurgery.date) {
        toast({ variant: 'destructive', title: "Missing Fields", description: "Please enter at least a name and date for the surgery."});
        return;
    }
    if (editingSurgeryId) {
        setSurgeries(surgeries.map(s => s.id === editingSurgeryId ? { ...s, ...currentSurgery } as Surgery : s));
        toast({ title: "Success", description: "Surgery has been updated." });
    } else {
        const surgeryToAdd: Surgery = { id: new Date().toISOString() + Math.random(), ...currentSurgery } as Surgery;
        setSurgeries([...surgeries, surgeryToAdd]);
        toast({ title: "Success", description: "Surgery has been added." });
    }
    setSurgeryDialogOpen(false);
  };
  
  const handleRemoveSurgery = (id: string) => { setSurgeries(surgeries.filter(s => s.id !== id)); toast({ title: "Surgery Removed" }); };

  const handleSaveChanges = () => {
    if (user) {
        const profileData = { ...biometrics, allergies, conditions, surgeries };
        updateUserData({ profile: profileData });
        toast({
          title: "Profile Updated",
          description: "Your information has been saved.",
        });
    }
  };

  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "light", label: "Lightly active (light exercise/sports 1-3 days/week)" },
    { value: "moderate", label: "Moderately active (moderate exercise/sports 3-5 days/week)" },
    { value: "active", label: "Very active (hard exercise/sports 6-7 days a week)" },
    { value: "extra", label: "Extra active (very hard exercise/sports & physical job)" },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
      </div>

      <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <Weight className="h-6 w-6 text-primary"/>
                    <div className="flex-1">
                        <CardTitle>Biometric Information</CardTitle>
                        <CardDescription>This data helps personalize recommendations across the app. It is stored only on your device.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center mb-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={biometrics.profilePic || undefined} alt="User Profile Picture" />
                            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <button 
                            onClick={() => profilePicInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer"
                        >
                            <Pencil className="h-6 w-6 text-white"/>
                        </button>
                        <input 
                            ref={profilePicInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleProfilePicUpload}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" placeholder="e.g., 30" value={biometrics.age} onChange={(e) => handleBiometricChange('age', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={biometrics.gender} onValueChange={(value) => handleBiometricChange('gender', value)}>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input id="weight" type="number" placeholder="e.g., 70" value={biometrics.weight} onChange={(e) => handleBiometricChange('weight', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input id="height" type="number" placeholder="e.g., 175" value={biometrics.height} onChange={(e) => handleBiometricChange('height', e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="activity-level">Activity Level</Label>
                        <Select value={biometrics.activityLevel} onValueChange={(value) => handleBiometricChange('activityLevel', value)}>
                            <SelectTrigger id="activity-level">
                                <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                                {activityLevels.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <Heart className="h-6 w-6 text-primary"/>
                    <div className="flex-1">
                        <CardTitle>Medical Information</CardTitle>
                        <CardDescription>This information is optional but can be useful for tracking purposes. It is stored only on your device.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Allergies */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base font-semibold"><AllergyIcon className="h-5 w-5"/> Allergies</Label>
                    <div className="space-y-3">
                        {allergies.length > 0 ? (
                            allergies.map(allergy => (
                                <div key={allergy.id} className="p-3 rounded-md border bg-secondary/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{allergy.name}</p>
                                            <div className="text-xs text-muted-foreground space-y-1 mt-1">
                                                {allergy.diagnosisDate && <p>Diagnosed: {new Date(allergy.diagnosisDate).toLocaleDateString()}</p>}
                                                {allergy.endDate ? <p>Ended: {new Date(allergy.endDate).toLocaleDateString()}</p> : <p>Ongoing</p>}
                                                {allergy.severity && <p>Severity: {allergy.severity}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(allergy, 'allergy')}><Pencil className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveAllergy(allergy.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                    {allergy.thingsToAvoid && <p className="text-sm mt-2 pt-2 border-t">Things to avoid: {allergy.thingsToAvoid}</p>}
                                    {allergy.document && (
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2">
                                            <a href={allergy.document} download={allergy.documentName} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                <FileText className="h-4 w-4"/> View Document
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No allergies logged.</p>
                        )}
                    </div>
                     <Button variant="outline" className="w-full mt-4" onClick={() => handleOpenAddDialog('allergy')}><Plus className="mr-2 h-4 w-4"/> Add Allergy</Button>
                </div>
                
                 {/* Medical Conditions */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base font-semibold"><Stethoscope className="h-5 w-5"/> Medical Conditions</Label>
                    <div className="space-y-3">
                        {conditions.length > 0 ? (
                            conditions.map(condition => (
                                <div key={condition.id} className="p-3 rounded-md border bg-secondary/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{condition.name}</p>
                                            <div className="text-xs text-muted-foreground space-y-1 mt-1">
                                                {condition.diagnosisDate && <p>Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}</p>}
                                                {condition.endDate ? <p>Ended: {new Date(condition.endDate).toLocaleDateString()}</p> : <p>Ongoing</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(condition, 'condition')}><Pencil className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveCondition(condition.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                    {condition.notes && <p className="text-sm mt-2 pt-2 border-t">Notes: {condition.notes}</p>}
                                    {condition.document && (
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2">
                                            <a href={condition.document} download={condition.documentName} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                <FileText className="h-4 w-4"/> View Document
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No medical conditions logged.</p>
                        )}
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => handleOpenAddDialog('condition')}><Plus className="mr-2 h-4 w-4"/> Add Medical Condition</Button>
                </div>

                {/* Surgeries */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base font-semibold"><ScalpelIcon className="h-5 w-5"/> Past Surgeries</Label>
                    <div className="space-y-3">
                        {surgeries.length > 0 ? (
                            surgeries.map(surgery => (
                                <div key={surgery.id} className="p-3 rounded-md border bg-secondary/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{surgery.name}</p>
                                            <p className="text-sm text-muted-foreground">Date: {new Date(surgery.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(surgery, 'surgery')}><Pencil className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveSurgery(surgery.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                    {surgery.precautions && <p className="text-sm mt-2 pt-2 border-t">Precautions: {surgery.precautions}</p>}
                                    {surgery.document && (
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2">
                                            <a href={surgery.document} download={surgery.documentName} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                <FileText className="h-4 w-4"/> View Document
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No surgeries logged.</p>
                        )}
                    </div>
                     <Button variant="outline" className="w-full mt-4" onClick={() => handleOpenAddDialog('surgery')}><Plus className="mr-2 h-4 w-4"/> Add Surgery</Button>
                </div>
            </CardContent>
        </Card>
        
        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
        </div>
      </div>

      {/* Allergy Dialog */}
      <Dialog open={isAllergyDialogOpen} onOpenChange={setAllergyDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingAllergyId ? 'Edit Allergy' : 'Add an Allergy'}</DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="allergy-name">Allergy Name</Label>
                    <Input id="allergy-name" value={currentAllergy.name} onChange={(e) => setCurrentAllergy({...currentAllergy, name: e.target.value})} placeholder="e.g., Peanuts"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="allergy-diagnosis-date">Diagnosis Date</Label>
                        <Input id="allergy-diagnosis-date" type="date" value={currentAllergy.diagnosisDate} onChange={(e) => setCurrentAllergy({...currentAllergy, diagnosisDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="allergy-end-date">End Date (optional)</Label>
                        <Input id="allergy-end-date" type="date" value={currentAllergy.endDate} onChange={(e) => setCurrentAllergy({...currentAllergy, endDate: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="allergy-severity">Severity (optional)</Label>
                    <Input id="allergy-severity" value={currentAllergy.severity} onChange={(e) => setCurrentAllergy({...currentAllergy, severity: e.target.value})} placeholder="e.g., Severe, Mild"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="allergy-avoid">Things to avoid (optional)</Label>
                    <Textarea id="allergy-avoid" value={currentAllergy.thingsToAvoid} onChange={(e) => setCurrentAllergy({...currentAllergy, thingsToAvoid: e.target.value})} placeholder="e.g., Peanut butter, certain oils"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="allergy-document">Attach Document (optional)</Label>
                    <Input id="allergy-document" type="file" onChange={(e) => handleFileChange(e, setCurrentAllergy)} />
                    {currentAllergy.documentName && (
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-sm text-muted-foreground truncate">Current file: {currentAllergy.documentName}</p>
                            <Button variant="link" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80" onClick={() => handleRemoveDocument(setCurrentAllergy)}>
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
                <Button onClick={handleSaveAllergy} className="w-full">{editingAllergyId ? 'Save Changes' : 'Add Allergy'}</Button>
            </div>
        </DialogContent>
      </Dialog>
      
      {/* Condition Dialog */}
      <Dialog open={isConditionDialogOpen} onOpenChange={setConditionDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingConditionId ? 'Edit Medical Condition' : 'Add a Medical Condition'}</DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="condition-name">Condition Name</Label>
                    <Input id="condition-name" value={currentCondition.name} onChange={(e) => setCurrentCondition({...currentCondition, name: e.target.value})} placeholder="e.g., Asthma"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="condition-diagnosis-date">Diagnosis Date</Label>
                        <Input id="condition-diagnosis-date" type="date" value={currentCondition.diagnosisDate} onChange={(e) => setCurrentCondition({...currentCondition, diagnosisDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="condition-end-date">End Date (optional)</Label>
                        <Input id="condition-end-date" type="date" value={currentCondition.endDate} onChange={(e) => setCurrentCondition({...currentCondition, endDate: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="condition-notes">Notes (optional)</Label>
                    <Textarea id="condition-notes" value={currentCondition.notes} onChange={(e) => setCurrentCondition({...currentCondition, notes: e.target.value})} placeholder="e.g., Diagnosed in 2020, use inhaler as needed."/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="condition-document">Attach Document (optional)</Label>
                    <Input id="condition-document" type="file" onChange={(e) => handleFileChange(e, setCurrentCondition)} />
                    {currentCondition.documentName && (
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-sm text-muted-foreground truncate">Current file: {currentCondition.documentName}</p>
                            <Button variant="link" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80" onClick={() => handleRemoveDocument(setCurrentCondition)}>
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
                <Button onClick={handleSaveCondition} className="w-full">{editingConditionId ? 'Save Changes' : 'Add Condition'}</Button>
            </div>
        </DialogContent>
      </Dialog>
      
      {/* Surgery Dialog */}
      <Dialog open={isSurgeryDialogOpen} onOpenChange={setSurgeryDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingSurgeryId ? 'Edit Past Surgery' : 'Add a Past Surgery'}</DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="surgery-name">Surgery Name</Label>
                    <Input id="surgery-name" value={currentSurgery.name} onChange={(e) => setCurrentSurgery({...currentSurgery, name: e.target.value})} placeholder="e.g., Appendectomy"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="surgery-date">Date of Surgery</Label>
                    <Input id="surgery-date" type="date" value={currentSurgery.date} onChange={(e) => setCurrentSurgery({...currentSurgery, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="surgery-precautions">Precautions (optional)</Label>
                    <Textarea id="surgery-precautions" value={currentSurgery.precautions} onChange={(e) => setCurrentSurgery({...currentSurgery, precautions: e.target.value})} placeholder="e.g., Avoid heavy lifting for 6 weeks"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="surgery-document">Attach Document (optional)</Label>
                    <Input id="surgery-document" type="file" onChange={(e) => handleFileChange(e, setCurrentSurgery)} />
                    {currentSurgery.documentName && (
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-sm text-muted-foreground truncate">Current file: {currentSurgery.documentName}</p>
                            <Button variant="link" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80" onClick={() => handleRemoveDocument(setCurrentSurgery)}>
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
                <Button onClick={handleSaveSurgery} className="w-full">{editingSurgeryId ? 'Save Changes' : 'Add Surgery'}</Button>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

    