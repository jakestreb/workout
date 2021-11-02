import * as path from 'path';
import * as sqlite3 from 'sqlite3';

export class Runner {
  private _db: sqlite3.Database;

  public async init(): Promise<void> {
    const dbPath = path.resolve(__dirname, './records.db');
    this._db = new sqlite3.Database(dbPath);

    // TODO: Move/Remove
    await this.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      experience TEXT,
      primary_focus TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this.run(`CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this.run(`CREATE TABLE IF NOT EXISTS records (
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
    await this.run(`CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id)`);
    await this.run(`CREATE INDEX IF NOT EXISTS idx_records_user_id_exercise ON records(user_id, exercise)`);
    try {
      // await this._addSampleData();
    } catch (err) {
      console.log(err);
    }
  }

  public async all(sql: string, params: any[] = []): Promise<({ [column: string]: any })[]> {
    return new Promise((resolve, reject) => {
      this._db.all(sql, params, function(err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
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

  // private async _addSampleData(): Promise<void> {
  //   await this.run(
  //     `INSERT INTO users (name, experience, primary_focus) VALUES
  //     ("Kelci", "beginner", "hypertrophy"),
  //     ("Michael", "beginner", "strength"),
  //     ("Vini", "beginner", "strength"),
  //     ("Jake", "intermediate", "hypertrophy"),
  //     ("Yudhi", "beginner", "strength")`
  //   );
  //   await this.run(
  //     `INSERT INTO workouts (id, date) VALUES
  //     ("1e00", "2021-10-15 11:45:23"),
  //     ("2e00", "2021-10-17 15:00:00")`
  //   );
  //   await this.run(
  //     `INSERT INTO records (user_id, workout_id, exercise, sets, reps, weight, reps_completed) VALUES
  //     (1, "1e00", "bench_press", 4, 8, 65, 32),
  //     (1, "1e00", "deadlift", 4, 8, 75, 32),
  //     (1, "2e00", "overhead_press", 4, 10, 45, 40),
  //     (1, "2e00", "squat", 4, 8, 95, 32),
  //     (1, "2e00", "dumbbell_row", 3, 10, 20, 30)`
  //   );
  // }
}

const db = new Runner();

export default db;
