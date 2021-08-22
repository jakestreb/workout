
export default class MuscleActivity {

	public static combine(...args: MuscleActivity[]): MuscleActivity {
		return args.reduce((a, b) => a.add(b), new MuscleActivity());
	}

	public map: {[muscle: string]: number} = {};

	constructor() {

	}

	public push(muscleName: string, activity: number) {
		this.map[muscleName] = activity;
	}

	public get(muscleName: string) {
		return this.map[muscleName];
	}

	public keys() {
		return Object.keys(this.map);
	}

	public add(activity: MuscleActivity): MuscleActivity {
		activity.keys().forEach(k => {
			this.map[k] = (this.map[k] || 0) + activity.get(k);
		});
		return this;
	}

	public overlaps(activity: MuscleActivity): boolean {
		for (const m of Object.keys(this.map)) {
			if (activity.get(m)) {
				return true;
			}
		}
		return false;
	}
}
