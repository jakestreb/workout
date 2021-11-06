import Base from './Base';
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

export default class Workouts extends Base {
  public async init(): Promise<this> {
    await this.db.run(`CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    return this;
  }

  public async add(arg: WorkoutRecord): Promise<void> {
    const workoutId = uuid();
    await this.db.run(`INSERT INTO workouts (id, date) VALUES (?, ?)`, [workoutId, arg.date]);
    const inserts = arg.records.map(userRecord => this.db.records.add({ workoutId, ...userRecord }));
    await Promise.all(inserts);
  }

  public async addSampleData(): Promise<void> {
    await this.db.run(
      `INSERT INTO workouts (id, date) VALUES
      ("1e00", "2021-10-15 11:45:23"),
      ("2e00", "2021-10-17 15:00:00")`
    );
  }
}
