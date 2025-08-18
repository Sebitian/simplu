'use client'

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Calendar,
  Edit2, 
  Plus,
  Activity,
  Trash2,
  X,
  ChevronDown
} from 'lucide-react';
import { WorkoutStep } from '@/types/workout';
// Import the sleep data statically
import sleepDataJson from '@/garmin/sebastian/DI_CONNECT/DI-Connect-Wellness/2025-04-13_2025-07-22_129258466_sleepData.json';

// Define interfaces for sleep data
interface SleepScores {
  overallScore: number;
  qualityScore: number;
  durationScore: number;
  recoveryScore: number;
  deepScore?: number;
  remScore?: number;
  lightScore?: number;
  awakeningsCountScore?: number;
  awakeTimeScore?: number;
  combinedAwakeScore?: number;
  restfulnessScore?: number;
  interruptionsScore?: number;
  feedback: string;
  insight: string;
}

interface SleepEntry {
  calendarDate?: string;
  sleepScores?: SleepScores;
  retro?: boolean;
  sleepStartTimestampGMT?: string;
  sleepEndTimestampGMT?: string;
  sleepWindowConfirmationType?: string;
  deepSleepSeconds?: number;
  lightSleepSeconds?: number;
  remSleepSeconds?: number;
  awakeSleepSeconds?: number;
  unmeasurableSeconds?: number;
  averageRespiration?: number;
  lowestRespiration?: number;
  highestRespiration?: number;
  awakeCount?: number;
  avgSleepStress?: number;
  restlessMomentCount?: number;
}

interface ProcessedSleepEntry {
  date: string;
  overallScore: number;
  qualityScore: number;
  durationScore: number;
  recoveryScore: number;
  feedback: string;
  insight: string;
}

interface DatabaseWorkout {
  id: number;
  workout_name: string;
  steps: WorkoutStep[];
  created_at: string;
}

interface UIWorkout {
  id: string;
  name: string;
  activityType: string;
  duration: string;
  edited: string;
  created: string;
}

// Function to parse Garmin sleep data and extract overall scores
function parseSleepData(): ProcessedSleepEntry[] {
  const sleepData = sleepDataJson as SleepEntry[];
  
  const sleepScores = sleepData
    .filter((entry: SleepEntry) => entry.sleepScores && entry.calendarDate) // Filter out entries without sleep scores
    .map((entry: SleepEntry) => ({
      date: entry.calendarDate!,
      overallScore: entry.sleepScores!.overallScore,
      qualityScore: entry.sleepScores!.qualityScore,
      durationScore: entry.sleepScores!.durationScore,
      recoveryScore: entry.sleepScores!.recoveryScore,
      feedback: entry.sleepScores!.feedback,
      insight: entry.sleepScores!.insight
    }))
    .sort((a: ProcessedSleepEntry, b: ProcessedSleepEntry) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
  
  return sleepScores;
}

// Function to log sleep scores to the console
function logSleepScores(): void {
  const sleepScores = parseSleepData();
  console.log('Sleep Scores Summary:');
  console.log('===================');
  sleepScores.forEach((entry: ProcessedSleepEntry) => {
    console.log(`${entry.date}: Overall Score ${entry.overallScore} - ${entry.insight}`);
  });
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('');
  
  // Add state for workouts and loading
  const [workouts, setWorkouts] = useState<UIWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add state for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [workoutToDelete, setWorkoutToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Function to fetch workouts from Supabase
  const fetchWorkouts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workouts_table')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database workouts to UI format
      const mappedWorkouts: UIWorkout[] = (data || []).map((workout: DatabaseWorkout) => ({
        id: workout.id.toString(),
        name: workout.workout_name,
        activityType: 'Strength Training', // Default since we don't have this field
        duration: '--', // Placeholder since we don't calculate duration yet
        edited: '--', // We don't have edited timestamp
        created: new Date(workout.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }));

      setWorkouts(mappedWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update useEffect to fetch workouts and log sleep scores
  useEffect(() => {
    logSleepScores();
    fetchWorkouts();
  }, [fetchWorkouts]);
  
  // You can add authentication check here if needed
  // const { data, error } = await supabase.auth.getClaims();
  // if (error || !data?.claims) {
  //   redirect("/auth/login");
  // }

  // Function to handle create workout button click
  const handleCreateWorkout = () => {
    if (selectedWorkoutType) {
      // Map short values to full workout type names for the URL
      const workoutTypeMap: { [key: string]: string } = {
        'strength': 'strength_training',
        'cardio': 'cardio',
        'flexibility': 'flexibility',
        'sports': 'sports',
        'other': 'other'
      };
      
      const urlType = workoutTypeMap[selectedWorkoutType] || selectedWorkoutType;
      router.push(`/workouts/create/${urlType}`);
    }
  };

  // Function to handle edit workout button click
  const handleEditWorkout = (workoutId: string) => {
    router.push(`/workouts/edit/${workoutId}`);
  };

  // Function to handle delete workout button click - shows confirmation modal
  const handleDeleteWorkout = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
    setDeleteModalOpen(true);
  };

  // Function to confirm workout deletion
  const confirmDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    
    try {
      setIsDeleting(true);
      const supabase = createClient();
      
      // Delete the workout
      const { error: deleteError } = await supabase
        .from('workouts_table')
        .delete()
        .eq('id', workoutToDelete);

      if (deleteError) throw deleteError;

      // Reset the ID sequence to the next available ID
      const { error: resetError } = await supabase.rpc('reset_workout_sequence');
      
      if (resetError) {
        console.warn('Could not reset sequence:', resetError);
        // Continue anyway - deletion was successful
      }

      // Remove the workout from local state
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutToDelete));
      
      // Close modal and reset state
      setDeleteModalOpen(false);
      setWorkoutToDelete(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
      setError('Failed to delete workout');
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to cancel workout deletion
  const cancelDeleteWorkout = () => {
    setDeleteModalOpen(false);
    setWorkoutToDelete(null);
  };

  return (
    <div className="w-full h-full p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Add this button right at the top */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Workouts</h1>
          <Button 
            onClick={logSleepScores}
            className="bg-blue-600 hover:bg-blue-700"
          >
             Test Sleep Scores
          </Button>
        </div>

        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">
            Manage your training routines and track your progress
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="my-workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="my-workouts">My Workouts</TabsTrigger>
            <TabsTrigger value="benchmark">Benchmark Exercises</TabsTrigger>
            <TabsTrigger value="find">Find a Workout</TabsTrigger>
          </TabsList>

          {/* My Workouts Tab */}
          <TabsContent value="my-workouts" className="space-y-4">
            {/* Controls Bar */}
            <div className="flex items-center">
              <Select onValueChange={setSelectedWorkoutType} value={selectedWorkoutType}>
                <SelectTrigger className="w-[225px]">
                  <SelectValue placeholder="Select a workout type..." />
                  <ChevronDown className="ml-auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className='bg-blue-400 ml-4'
                disabled={!selectedWorkoutType}
                onClick={handleCreateWorkout}
              >
                Create a workout
              </Button>
              
              {/* <Button onClick={() => {
                logSleepScores();
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Create a Workout
              </Button> */}
            </div>

            {/* Workouts Table */}
            <Card>
              <CardContent className="p-0">
                {error ? (
                  <div className="p-6 text-center text-red-600">
                    {error}
                    <Button 
                      variant="outline" 
                      className="ml-4"
                      onClick={fetchWorkouts}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Activity Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Edited</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading workouts...
                          </TableCell>
                        </TableRow>
                      ) : workouts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-muted-foreground">
                              <Activity className="mx-auto h-12 w-12 mb-2" />
                              <p>No workouts found</p>
                              <p className="text-sm">Create your first workout to get started</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        workouts.map((workout) => (
                          <TableRow key={workout.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditWorkout(workout.id)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                  {workout.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <Activity className="mr-1 h-3 w-3" />
                                {workout.activityType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {workout.duration}
                            </TableCell>
                            <TableCell>{workout.edited}</TableCell>
                            <TableCell>{workout.created}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteWorkout(workout.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benchmark Exercises Tab */}
          <TabsContent value="benchmark" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Exercises</CardTitle>
                <CardDescription>
                  Track your personal records and strength benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No benchmark exercises yet</h3>
                  <p className="text-muted-foreground">Create your first benchmark to get started</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Benchmark Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Find a Workout Tab */}
          <TabsContent value="find" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Find a Workout</CardTitle>
                <CardDescription>
                  Browse and discover new workout routines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">Workout library coming soon</h3>
                  <p className="text-muted-foreground">Discover pre-built workouts and training programs</p>
                  <Button className="mt-4" variant="outline">
                    Browse Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">DELETE WORKOUT</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelDeleteWorkout}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete your workout? This cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDeleteWorkout}
                disabled={isDeleting}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteWorkout}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
