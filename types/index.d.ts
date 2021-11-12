declare interface Target {
	muscles: string[];
	intensity: number;
	timeMinutes: number;
}

declare interface TargetRecord {
	name: string;
	phases: TargetRecordPhase[];
}

declare interface TargetRecordPhase {
	muscles: string[];
	weight: number;
}

declare interface GeneratorProgress {
	generated: number,
	filtered: number,
	isDone: boolean,
}

declare interface DBRecordBasics {
  exercise: string,
  sets: number,
  reps: number,
  weight: number,
  completed: boolean,
  created_at: string
}

declare interface DBRecord extends DBRecordBasics {
  user_id: number,
  workout_id: string
}

declare interface DBUser {
  name: string,
  gender: 'male'|'female'|'other',
  experience: 'beginner'|'intermediate'|'advanced',
  primary_focus: 'strength'|'endurance'
}

declare interface JSONExercise {
  name: string,
  weight: number,
  activations: JSONActivation[],
  secondsPerRep: number,
  sets: number[]
  reps: number[]
  skills: {
  	endurance: number,
   	strength: number,
  },
  weightStandards: {
  	male: number,
  	female: number
  }
  supersetGroups: string[],
  isBodyweightExercise: boolean
}

declare interface JSONActivation {
  muscle: string,
  intensityPerRep: number
}

declare interface JSONMuscle {
	name: string;
	defaultWeight?: number;
	components?: JSONMuscle[];
}

declare interface APIWorkout {
  sets: APIWorkoutSet[];
  intensity: number;
  activity: APIMuscleActivity;
  time: number;
}

declare interface APIWorkoutSet {
  exercise: string;
  sets: number;
  reps: number;
  activity: APIMuscleActivity;
}

declare interface APIMuscleActivity {
  [muscle: string]: number;
}
