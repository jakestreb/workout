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
}

export {};
