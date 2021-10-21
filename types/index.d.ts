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
}

export {};
