declare global {
	interface Target {
		muscles: string[];
		intensity: number;
		timeMinutes: number;
	}

	interface TargetRecord {
		name: string;
		phases: TargetRecordPhase[];
	}

	interface TargetRecordPhase {
		muscles: string[];
		weight: number;
	}

	interface GeneratorProgress {
		generated: number,
		filtered: number,
		isDone: boolean,
	}

	interface RecordBasics {
	  exercise: string,
	  sets: number,
	  reps: number,
	  weight: number,
	  completed: boolean,
	  created_at: string
	}

	interface DBRecord extends RecordBasics {
	  user_id: number,
	  workout_id: string
	}

	interface DBUser {
	  name: string,
	  gender: 'male'|'female'|'other',
	  experience: 'beginner'|'intermediate'|'advanced',
	  primary_focus: 'strength'|'endurance',
	  created_at: string
	}
}

export {};
