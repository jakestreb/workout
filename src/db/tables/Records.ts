import Base from './Base';

export default class Records extends Base {
  public async init(): Promise<this> {
    await this.db.run(`CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      workout_id INTEGER,
      exercise TEXT,
      sets INTEGER,
      reps INTEGER,
      weight INTEGER,
      completed INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this.db.run(`CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id)`);
    await this.db.run(`CREATE INDEX IF NOT EXISTS idx_records_user_id_exercise ON records(user_id, exercise)`);

    return this;
  }

  public async addSampleData(): Promise<void> {
    await this.db.run(
      `INSERT INTO records (user_id, workout_id, exercise, sets, reps, weight, completed) VALUES
      (1, "1e00", "bench_press", 4, 8, 65, 1),
      (1, "1e00", "deadlift", 4, 8, 75, 1),
      (1, "2e00", "overhead_press", 4, 10, 45, 0),
      (1, "2e00", "squat", 4, 8, 95, 0),
      (1, "2e00", "dumbbell_row", 3, 10, 20, 1)`
    );
  }

  public async add(arg: DBRecord): Promise<void> {
    await this.db.run(
      `INSERT INTO records (
        user_id, workout_id, exercise, sets, reps, weight, completed
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [arg.user_id, arg.workout_id, arg.exercise, arg.sets, arg.reps, arg.weight, arg.completed]
    );
  }

  public async getForUser(userId: number): Promise<DBRecord[]> {
    return await this.db.all(`SELECT * FROM records WHERE user_id = ? ORDER BY created_at DESC`, [userId]) as DBRecord[];
  }
}
