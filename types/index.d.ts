declare type Skill = 'endurance'|'strength';

declare interface IWorkoutSeed {
  difficulty: Difficulty;
	muscles: string[];
	timeMinutes: number;
}

declare interface IWorkoutTarget {
  difficulty: Difficulty;
  muscleGoals: IMuscleScores;
  focusMuscleGoals: IMuscleScores;
  enduranceRatio: number;
  timeMinutes: number;
};

declare interface IScore {
  endurance: number;
  strength: number;
}

declare interface IMuscleScores {
  [muscle: string]: IScore;
}

declare interface IRepsWeight {
  reps: number[];
  weight: number|null;
}

declare interface IWorkout {
  sets: IWorkoutSet[];
  muscleScores: IMuscleScores;
  time: number;
}

declare interface IWorkoutSet {
  exercise: string;
  sets: number;
  reps: number;
  muscleScores: IMuscleScores;
}

declare interface GeneratorProgress {
	generated: number;
	filtered: number;
	isDone: boolean;
}

declare interface DBRecordBasics {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  completed: boolean;
  created_at: string;
}

declare interface DBRecord extends DBRecordBasics {
  user_id: number;
  workout_id: string;
}

declare interface DBUser {
  id?: number;
  name: string;
  gender: 'male'|'female'|'other';
  weight: number;
  experience: 'beginner'|'intermediate'|'advanced';
}

declare interface JSONExercise {
  name: string;
  weight: number;
  activations: JSONActivation[];
  secondsPerRep: number;
  reps: {
    endurance: number;
    strength: number;
  }
  weightStandards: {
  	male: number;
  	female: number;
  }
  supersetGroups: string[];
  isBodyweightExercise: boolean;
}

declare interface JSONActivation {
  muscle: string;
  activity: number;
}

declare interface JSONMuscle {
  name: string;
  components?: JSONMuscle[];
}
