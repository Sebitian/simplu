'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit3, Info, Trash2, GripVertical, Plus, RotateCcw, Dumbbell } from 'lucide-react';
import { WorkoutStep } from '@/types/workout';
import { createClient } from '@/lib/supabase/client';

export default function EditWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutSteps, setWorkoutSteps] = useState<WorkoutStep[]>([]);

  // Function to load existing workout data
  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('workouts_table')
          .select('*')
          .eq('id', workoutId)
          .single();

        if (error) throw error;

        setWorkoutTitle(data.workout_name);
        setWorkoutSteps(data.steps || []);
      } catch (error) {
        console.error('Error loading workout:', error);
        alert('Failed to load workout');
        router.push('/workouts');
      } finally {
        setIsLoading(false);
      }
    };

    if (workoutId) {
      loadWorkout();
    }
  }, [workoutId, router]);

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

  const handleUpdateWorkout = async () => {
    if (!workoutTitle.trim()) {
      alert('Please enter a workout title');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      
      // Update workout with steps as JSONB
      const workoutData = {
        workout_name: workoutTitle,
        steps: workoutSteps.map((step, index) => ({
          ...step,
          order_index: index + 1
        }))
      };
      
      const { error } = await supabase
        .from('workouts_table')
        .update(workoutData)
        .eq('id', workoutId);

      if (error) throw error;
      
      // Redirect to workouts page
      router.push('/workouts');
      
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-6">
        <div className="text-center">Loading workout...</div>
      </div>
    );
  }

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
            onClick={handleUpdateWorkout}
            disabled={isSaving}
          >
            {isSaving ? 'Updating...' : 'Update Workout'}
          </Button>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Exercise Steps */}
        {workoutSteps.length > 0 ? (
          workoutSteps.map((step, index) => (
            <Card key={index} className="border-l-4 border-l-blue-600">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  {/* Left side with drag handle and title */}
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-grab">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </Button>
                    <div>
                      <h3 className="font-medium">Exercise</h3>
                    </div>
                  </div>
                  
                  {/* Right side with actions */}
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Info className="h-4 w-4 text-blue-600" />
                    </Button>
                    <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                      Select an exercise
                    </span>
                    <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                      Edit Step
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Exercise details */}
                <div className="mt-4 flex items-center gap-8">
                  <div>
                    <div className="text-2xl font-bold">{step.exercise_name}</div>
                    <div className="text-sm text-gray-500">Exercise</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{step.reps} Reps</div>
                    <div className="text-sm text-gray-500">Target</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                {/* Left side with drag handle and title */}
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-grab">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </Button>
                  <div>
                    <h3 className="font-medium">Exercise</h3>
                  </div>
                </div>
                
                {/* Right side with actions */}
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4 text-blue-600" />
                  </Button>
                  <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                    Select an exercise
                  </span>
                  <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                    Edit Step
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Exercise details */}
              <div className="mt-4 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold">No exercises</div>
                  <div className="text-sm text-gray-500">Exercise</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">-- Reps</div>
                  <div className="text-sm text-gray-500">Target</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
