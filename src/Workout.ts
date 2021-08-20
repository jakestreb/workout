
export interface Set {
  exercise: Exercise;
  reps: number[];
}

export interface SuperSet {
  sets: Set[],
}

export interface Exercise {
  name: string;
  activations: Activation[];
  // equipment: Equipment[];
  reps: number;
  secondsPerRep: number;
  tags: string[];
}

export interface Activation {
  muscle: Muscle;
  intensity: number;
}

export interface Muscle {
  name: string;
}

// export interface Equipment {
//   name: string;
// }

const MAX_LEFTOVER_TIME_S = 5 * 60;

export class Workout {
  public static async generate(targets: Activation[], intensity: number, timeMinutes: number): Promise<Workout> {
  	// Break targets into most specific muscles

  	// Collect relevant exercises

  	// Select exercises optimizing for activation/time
  	const sets: Set|SuperSet[] = [];
  	let secondsRemaining = timeMinutes * 60;
  	while (secondsRemaining > MAX_LEFTOVER_TIME_S) {

  	}

    return new Workout(sets);
  }

  constructor(
  	public sets: Set|SuperSet[],
  ) {

  }
}
