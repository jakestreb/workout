import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { uuid } from 'uuidv4';

interface WorkoutRecord {
  date: Date,
  records: UserRecord[]
}

interface Record extends RecordBasics {
  userId: number,
  workoutId: string
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

export class RecordManager {
  private _db: sqlite3.Database;

  constructor() {
    const dbPath = path.resolve(__dirname, './records.db');
    this._db = new sqlite3.Database(dbPath);
  }

  public async init(): Promise<void> {
    await this._run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      experience TEXT,
      primary_focus TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this._run(`CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this._run(`CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      workout_id INTEGER,
      exercise TEXT,
      sets INTEGER,
      reps INTEGER,
      weight INTEGER,
      reps_completed INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this._run(`CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id)`);
    await this._run(`CREATE INDEX IF NOT EXISTS idx_records_user_id_exercise ON records(user_id, exercise)`);

    // TODO: Remove
    try {
      await this._addSampleData();
    } catch (err) {
      console.log(err);
    }
  }

  public async addWorkout(arg: WorkoutRecord): Promise<void> {
    const workoutId = uuid();
    await this._run(`INSERT INTO workouts (id, date) VALUES (?, ?)`, [workoutId, arg.date]);
    const inserts = arg.records.map(userRecord => this._add({ workoutId, ...userRecord }));
    await Promise.all(inserts);
  }

  private async _add(arg: Record): Promise<void> {
    await this._run(
      `INSERT INTO records (
        user_id, workout_id, exercise, sets, reps, weight, repsCompleted
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [arg.userId, arg.workoutId, arg.exercise, arg.sets, arg.reps, arg.weight, arg.repsCompleted]
    );
  }

  private async _addSampleData(): Promise<void> {
    await this._run(
      `INSERT INTO users (name, experience, primary_focus) VALUES
      ("Kelci", "beginner", "hypertrophy"),
      ("Michael", "beginner", "strength"),
      ("Vini", "beginner", "strength"),
      ("Jake", "intermediate", "hypertrophy"),
      ("Yudhi", "beginner", "strength")`
    );
    await this._run(
      `INSERT INTO workouts (id, date) VALUES
      ("1e00", 2021-10-15 11:45:23),
      ("2e00", 2021-10-17 15:00:00)`
    );
    await this._run(
      `INSERT INTO records (user_id, workout_id, exercise, sets, reps, weight, reps_completed) VALUES
      (1, "1e00", "bench_press", 4, 8, 65, 32),
      (1, "1e00", "deadlift", 4, 8, 75, 32),
      (1, "2e00", "overhead_press", 4, 10, 45, 40),
      (1, "2e00", "squat", 4, 8, 95, 32),
      (1, "2e00", "dumbbell_row", 3, 10, 20, 30)`
    );
  }

  private async _run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this._db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
