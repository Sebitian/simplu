'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit3, Info, Trash2, GripVertical, Plus, RotateCcw, Dumbbell } from 'lucide-react';
import { WorkoutStep } from '@/types/workout';
import { createClient } from '@/lib/supabase/client';

export default function CreateWorkoutPage() {
  const router = useRouter();
  
  const [workoutTitle, setWorkoutTitle] = useState('Strength Workout');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workoutSteps, setWorkoutSteps] = useState<WorkoutStep[]>([
    {
      exercise_id: 3,
      exercise_name: 'Squat',
      reps: 10,
      order_index: 1
    }
  ]);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<{[key: number]: any}>({});

  // Function to go back to workouts page
  const handleGoBack = () => {
    router.push('/workouts');
  };

  // Function to handle title edit
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  // Function to save title
  const handleTitleSave = () => {
    setIsEditingTitle(false);
  };

  // Function to handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setWorkoutTitle(e.target.value);
  };

  // Function to handle key press in title input
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!workoutTitle.trim()) {
      alert('Please enter a workout title');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      
      // Create workout with steps as JSONB
      const workoutData = {
        workout_name: workoutTitle,
        steps: workoutSteps.map((step, index) => ({
          ...step,
          order_index: index + 1
        }))
      };
      
      const { error } = await supabase
        .from('workouts_table')
        .insert(workoutData)
        .select()
        .single();

      if (error) throw error;
      
      // Redirect to workouts page
      router.push('/workouts');
      
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle step click
  const handleStepClick = (index: number) => {
    if (expandedStepIndex === index) {
      setExpandedStepIndex(null);
    } else {
      setExpandedStepIndex(index);
      // Initialize form data for this step
      setFormData({
        ...formData,
        [index]: {
          stepType: 'Exercise',
          exerciseName: workoutSteps[index].exercise_name,
          targetType: 'Reps',
          targetValue: workoutSteps[index].reps,
          weightType: workoutSteps[index].weight_lbs ? 'Fixed' : 'Not Set',
          weightValue: workoutSteps[index].weight_lbs || '',
          notes: ''
        }
      });
    }
  };

  // Function to update form data
  const updateFormData = (stepIndex: number, field: string, value: any) => {
    setFormData({
      ...formData,
      [stepIndex]: {
        ...formData[stepIndex],
        [field]: value
      }
    });
  };

  // Function to save step
  const handleSaveStep = (stepIndex: number) => {
    const data = formData[stepIndex];
    const updatedSteps = [...workoutSteps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      exercise_name: data.exerciseName,
      reps: parseInt(data.targetValue) || 0,
      weight_lbs: data.weightType === 'Fixed' ? parseInt(data.weightValue) || undefined : undefined
    };
    setWorkoutSteps(updatedSteps);
    setExpandedStepIndex(null);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full space-y-6 p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleGoBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">WORKOUTS</h1>
          </div>
        </div>

        {/* Workout Title Section */}
        <div className="flex items-center gap-3">
          {/* Dumbbell Icon */}
          <div className="p-2 border rounded-full">
            <Dumbbell className="h-5 w-5" />
          </div>
          
          {/* Editable Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={workoutTitle}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                className="text-2xl font-bold border-none p-0 h-auto focus:outline-none bg-transparent min-w-[200px]"
                autoFocus
              />
            ) : (
              <h2 className="text-2xl font-bold">{workoutTitle}</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTitleEdit}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleSaveWorkout}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Workout'}
          </Button>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Default Exercise Step */}
        {workoutSteps.map((step, index) => {
          const isExpanded = expandedStepIndex === index;
          const stepFormData = formData[index] || {};
          
          return (
            <Card 
              key={index} 
              className="border-l-4 border-l-blue-600 hover:border-blue-600 hover:ring-2 hover:ring-blue-200 transition-all duration-200"
            >
              <CardContent className="p-4">
                {/* Header row - always visible */}
                <div className="flex items-start justify-between">
                  {/* Left side with drag handle and title */}
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 cursor-grab"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </Button>
                    <div>
                      <h3 className="font-medium">{isExpanded ? 'Editing Step...' : 'Exercise'}</h3>
                    </div>
                  </div>
                  
                  {/* Right side with actions */}
                  <div className="flex items-center gap-3">
                    {/* <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                    >
                      <Info className="h-4 w-4 text-blue-600" />
                    </Button> */}
                    <span 
                      className="text-blue-600 text-sm cursor-pointer hover:underline"
                      onClick={() => handleStepClick(index)}
                    >
                      Edit Step
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Collapsed view - exercise details */}
                {!isExpanded && (
                  <div className="mt-4 flex items-center gap-8">
                    <div>
                      <div className="text-2xl font-bold">{step.exercise_name}</div>
                      <div className="text-sm text-gray-500">Exercise</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{step.reps} Reps</div>
                      <div className="text-sm text-gray-500">Target</div>
                    </div>
                    {step.weight_lbs && (
                      <div>
                        <div className="text-2xl font-bold">{step.weight_lbs} lbs</div>
                        <div className="text-sm text-gray-500">Weight</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded view - form */}
                {isExpanded && (
                  <div className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column - Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Details</h4>
                        
                        {/* Step Type */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Step Type</label>
                          <select 
                            value={stepFormData.stepType || 'Exercise'}
                            onChange={(e) => updateFormData(index, 'stepType', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="Exercise">Exercise</option>
                            <option value="Rest">Rest</option>
                            <option value="Note">Note</option>
                          </select>
                        </div>

                        {/* Exercise Section */}
                        <h5 className="font-semibold mt-6">Exercise</h5>
                        
                        {/* Exercise Type */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Type</label>
                          <select 
                            value={stepFormData.exerciseName || ''}
                            onChange={(e) => updateFormData(index, 'exerciseName', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Choose an Exercise</option>
                            <option value="Squat">Squat</option>
                            <option value="Bench Press">Bench Press</option>
                            <option value="Deadlift">Deadlift</option>
                            <option value="Push-up">Push-up</option>
                            <option value="Pull-up">Pull-up</option>
                          </select>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </div>
                            <span className="text-xs text-blue-600">An exercise is required.</span>
                          </div>
                        </div>

                        {/* Target Setting Section */}
                        <h5 className="font-semibold mt-6">Target Setting</h5>
                        
                        {/* Target Type */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Target Type</label>
                          <select 
                            value={stepFormData.targetType || 'Reps'}
                            onChange={(e) => updateFormData(index, 'targetType', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="Reps">Reps</option>
                            <option value="Time">Time</option>
                            <option value="Distance">Distance</option>
                          </select>
                        </div>

                        {/* Target Value */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Target</label>
                          <div className="flex gap-2">
                            <input 
                              type="number"
                              value={stepFormData.targetValue || ''}
                              onChange={(e) => updateFormData(index, 'targetValue', e.target.value)}
                              className="flex-1 p-2 border rounded-md"
                            />
                            <span className="p-2 bg-gray-100 dark:bg-gray-800 border rounded-md min-w-[60px] text-center dark:text-gray-200">
                              {stepFormData.targetType === 'Reps' ? 'reps' : 
                               stepFormData.targetType === 'Time' ? 'sec' : 'mi'}
                            </span>
                          </div>
                        </div>

                        {/* Weight Section */}
                        <h5 className="font-semibold mt-6">Weight</h5>
                        
                        {/* Weight Type */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Type</label>
                          <select 
                            value={stepFormData.weightType || 'Not Set'}
                            onChange={(e) => updateFormData(index, 'weightType', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="Not Set">Not Set</option>
                            <option value="Fixed">Fixed</option>
                            <option value="Percentage">Percentage</option>
                          </select>
                        </div>

                        {/* Weight Value */}
                        {stepFormData.weightType === 'Fixed' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
                            <input 
                              type="number"
                              value={stepFormData.weightValue || ''}
                              onChange={(e) => updateFormData(index, 'weightValue', e.target.value)}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                        )}
                      </div>

                      {/* Right Column - Notes */}
                      <div>
                        <h4 className="font-semibold mb-4">Notes</h4>
                        <textarea 
                          value={stepFormData.notes || ''}
                          onChange={(e) => updateFormData(index, 'notes', e.target.value)}
                          placeholder="Add step notes"
                          className="w-full h-48 p-3 border rounded-md resize-none"
                          maxLength={200}
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                          {(stepFormData.notes?.length || 0)}/200
                        </div>
                      </div>
                    </div>

                    {/* Done Button */}
                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={() => handleSaveStep(index)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Additional Action Buttons */}
        <div className="flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="mr-2 h-4 w-4" />
            Add Sets
          </Button>
        </div>

        {/* Add Note Link */}
        <div className="text-blue-600 text-sm cursor-pointer hover:underline">
          Add Note
        </div>

        {/* Disclaimer */}
        <div className="text-sm text-gray-500 mt-8">
          Simplu will store your workout for you to use on your device or in Supabase and will not share it with others.
        </div>
      </div>
    </div>
  );
}
