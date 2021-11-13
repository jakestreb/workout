import * as muscleTree from '../raw/muscle_tree.json';

export default class MuscleData {
	private _map: {[name: string]: JSONMuscle};

	constructor() {
		this._initMap();
	}

	public get(name: string): JSONMuscle {
		return this._map[name];
	}

	public getWeight(name: string): number {
		const weight = this._map[name].defaultWeight;
		if (!weight) {
			throw new Error(`Cannot get weight of invalid component muscle: ${name}`);
		}
		return weight;
	}

	public getComponents(name: string): JSONMuscle[] {
		const doGetComponents = function(record: JSONMuscle): JSONMuscle[] {
			if (record.components) {
				return ([] as JSONMuscle[]).concat.apply([], record.components.map(doGetComponents));
			}
			return [record];
		}
		const record = this._map[name];
		return record.components ? doGetComponents(record) : [];
	}

	private _initMap() {
		const doInit = (muscle: JSONMuscle): void => {
			this._map[muscle.name] = muscle;
			(muscle.components || []).map(muscle => doInit(muscle));
		}
		doInit(muscleTree);
	}
}
