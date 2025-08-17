'use client'

import React from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
  Edit3,
  MoreHorizontal,
  Plus,
  Activity
} from 'lucide-react';

interface DatabaseWorkout {
  id: number;
  workout_name: string;
  steps: any[];
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
function parseSleepData() {
  // Import the sleep data (you'll need to import this JSON file)
  const sleepData = require('@/garmin/sebastian/DI_CONNECT/DI-Connect-Wellness/2025-04-13_2025-07-22_129258466_sleepData.json');
  
  const sleepScores = sleepData
    .filter((entry: any) => entry.sleepScores && entry.calendarDate) // Filter out entries without sleep scores
    .map((entry: any) => ({
      date: entry.calendarDate,
      overallScore: entry.sleepScores.overallScore,
      qualityScore: entry.sleepScores.qualityScore,
      durationScore: entry.sleepScores.durationScore,
      recoveryScore: entry.sleepScores.recoveryScore,
      feedback: entry.sleepScores.feedback,
      insight: entry.sleepScores.insight
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
  
  return sleepScores;
}

// Function to get score color based on value
function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

// Function to format date nicely
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Function to log sleep scores to the console
function logSleepScores() {
  const sleepScores = parseSleepData();
  console.log('Sleep Scores Summary:');
  console.log('===================');
  sleepScores.forEach((entry: any) => {
    console.log(`${entry.date}: Overall Score ${entry.overallScore} - ${entry.insight}`);
  });
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [selectedWorkoutType, setSelectedWorkoutType] = React.useState<string>('');
  
  // Add state for workouts and loading
  const [workouts, setWorkouts] = React.useState<UIWorkout[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Function to fetch workouts from Supabase
  const fetchWorkouts = React.useCallback(async () => {
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
  React.useEffect(() => {
    logSleepScores();
    fetchWorkouts();
  }, [fetchWorkouts]);
  
  // You can add authentication check here if needed
  // const { data, error } = await supabase.auth.getClaims();
  // if (error || !data?.claims) {
  //   redirect("/auth/login");
  // }

  // Get sleep data
  const sleepScores = parseSleepData();
  
  // Calculate some basic stats
  const avgOverallScore = sleepScores.reduce((sum: number, entry: any) => sum + entry.overallScore, 0) / sleepScores.length;
  const maxScore = Math.max(...sleepScores.map((entry: any) => entry.overallScore));
  const minScore = Math.min(...sleepScores.map((entry: any) => entry.overallScore));

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
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a workout type..." />
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
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Edit3 className="h-3 w-3" />
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
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Activity className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Workout</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
    </div>
  );
}
