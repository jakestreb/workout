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

declare interface RecordBasics {
  exercise: string,
  sets: number,
  reps: number,
  weight: number,
  completed: boolean,
  created_at: string
}

declare interface DBRecord extends RecordBasics {
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
	children?: JSONMuscle[];
}
