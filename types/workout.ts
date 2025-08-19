export interface WorkoutStep {
  exercise_id: number;
  exercise_name: string;
  reps: number;
  weight_lbs?: number;
  order_index: number;
}

export interface Workout {
  id?: number;
  workout_name: string;
  notes?: string;
  steps: WorkoutStep[];
  created_at?: string;
}

export interface StepFormData {
  stepType: string;
  exerciseName: string;
  targetType: string;
  targetValue: string | number;
  weightType: string;
  weightValue: string | number;
  notes: string;
}

export interface DatabaseWorkout {
  id: number;
  workout_name: string;
  steps: WorkoutStep[];
  created_at: string;
}

export interface UIWorkout {
  id: string;
  name: string;
  activityType: string;
  duration: string;
  edited: string;
  created: string;
}

export interface SleepScores {
  overallScore: number;
  qualityScore: number;
  durationScore: number;
  recoveryScore: number;
  feedback: string;
  insight: string;
}

export interface SleepEntry {
  calendarDate?: string;
  sleepScores?: SleepScores;
  retro?: boolean;
}

export interface ProcessedSleepEntry {
  date: string;
  overallScore: number;
  qualityScore: number;
  durationScore: number;
  recoveryScore: number;
  feedback: string;
  insight: string;
}
