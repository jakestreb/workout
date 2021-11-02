import Records from './Records';
import db from './db';
import { uuid } from 'uuidv4';

interface WorkoutRecord {
  date: Date,
  records: UserRecord[]
}

interface UserRecord extends RecordBasics {
  userId: number
}

interface RecordBasics {
  exercise: string,
  sets: number,
  reps: number,
  weight: number,
  repsCompleted: number
}

export default class Workouts {
  public static async add(arg: WorkoutRecord): Promise<void> {
    const workoutId = uuid();
    await db.run(`INSERT INTO workouts (id, date) VALUES (?, ?)`, [workoutId, arg.date]);
    const inserts = arg.records.map(userRecord => Records.add({ workoutId, ...userRecord }));
    await Promise.all(inserts);
  }
}
