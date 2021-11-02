// import Records from './db/Records';



// check if (weight, most reps / all reps) (weight and star)

// REP RECS:

// get last n times you did the exercise
// if last thing is dropped reps, use min less
// if last thing is most reps, do it again
// if last thing is all reps, do min inc more (if fits goal)

// WEIGHT RECS (for # of reps):

// get last n times you did the exercise
// if last thing is dropped weight, use min less
// if last thing is most reps, do it again
// if last thing is all reps, do min inc more (if fits goal)

// (scale each a bit by time since)

// STRENGTH:

// exerciseStrength = (weight rec for exercise @ low rep / weight ratio for gender)

// sum of

// exerciseStrength *
// (muscleIntensity / total) *
// (Exercise.strengthAffect / total strengthAffect of performed)

// for each muscle/exercise

// ENDURANCE:

// exerciseEndurance = (rep rec / max for exercise)

// sum of

// exerciseEndurance *
// (muscleIntensity / total) *
// (Exercise.enduranceAffect / total enduranceAffect of performed)

// for each muscle/exercise



// export default class BodyProfile {

// 	public static async fromUserRecords(userId: number): Promise<BodyProfile> {
// 		const records = await Records.getForUser(userId);
// 		// TODO
// 		return new BodyProfile();
// 	}

// 	private readonly _strength: {[muscle: string]: number} = {};
// 	private readonly _endurance: {[muscle: string]: number} = {};

// 	constructor() {

// 	}
// }
