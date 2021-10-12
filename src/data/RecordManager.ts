import * as path from 'path';
import * as sqlite3 from 'sqlite3';

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
      success INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this._run(`CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id)`);
    await this._run(`CREATE INDEX IF NOT EXISTS idx_records_user_id_exercise ON records(user_id, exercise)`);
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
