import muscleTree from '../raw/muscle_tree.json';

export default class MuscleData {
	private _all: {[name: string]: JSONMuscle} = {};
	private _components: {[name: string]: JSONMuscle} = {};

	constructor() {
		this._initMaps();
	}

	public get names(): string[] {
		return Object.keys(this._all);
	}

	public get componentNames(): string[] {
		return Object.keys(this._components);
	}

	public get(name: string): JSONMuscle {
		return this._all[name];
	}

	public getComponents(name: string): JSONMuscle[] {
		const doGetComponents = function(record: JSONMuscle): JSONMuscle[] {
			if (record.components) {
				return ([] as JSONMuscle[]).concat.apply([], record.components.map(doGetComponents));
			}
			return [record];
		}
		const record = this._all[name];
		return record.components ? doGetComponents(record) : [];
	}

	private _initMaps() {
		const doInit = (muscle: JSONMuscle): void => {
			this._all[muscle.name] = muscle;
			if (muscle.components) {
				muscle.components.map(muscle => doInit(muscle))
			} else {
				this._components[muscle.name] = muscle;
			}
		}
		doInit(muscleTree);
	}
}
