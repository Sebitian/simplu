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
  