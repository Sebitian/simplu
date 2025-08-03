import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

// Sample workout data - replace with your actual data
const workouts = [
  {
    id: '1',
    name: 'SSTT D4:W1',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Jul 4, 2025',
    created: 'Jul 4, 2025',
  },
  {
    id: '2',
    name: 'SSTT D3:W1',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Jul 4, 2025',
    created: 'Jul 3, 2025',
  },
  {
    id: '3',
    name: 'SSTT D3:W2',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Mar 26, 2025',
    created: 'Mar 26, 2025',
  },
  {
    id: '4',
    name: 'SSTT D2:W2',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Mar 24, 2025',
    created: 'Mar 24, 2025',
  },
  {
    id: '5',
    name: 'SSTT D1:W2',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Mar 23, 2025',
    created: 'Mar 23, 2025',
  },
  {
    id: '6',
    name: 'JHS 8x8 D3:W1',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Feb 28, 2025',
    created: 'Feb 28, 2025',
  },
  {
    id: '7',
    name: 'JHS 8x8 D1:W1',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Feb 24, 2025',
    created: 'Feb 24, 2025',
  },
  {
    id: '8',
    name: 'Random_Back',
    activityType: 'Strength Training',
    duration: '--',
    edited: 'Jan 31, 2025',
    created: 'Jan 31, 2025',
  },
];

export default async function WorkoutsPage() {
  const supabase = await createClient();
  
  // You can add authentication check here if needed
  // const { data, error } = await supabase.auth.getClaims();
  // if (error || !data?.claims) {
  //   redirect("/auth/login");
  // }

  return (
    <div className="w-full h-full p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
            <div className="flex items-center justify-between">
              <Select>
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
              
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create a Workout
              </Button>
            </div>

            {/* Workouts Table */}
            <Card>
              <CardContent className="p-0">
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
                    {workouts.map((workout) => (
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
                    ))}
                  </TableBody>
                </Table>
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
