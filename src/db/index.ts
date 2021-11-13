import Records from './tables/Records';
import Users from './tables/Users';
import Workouts from './tables/Workouts';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';

class DBManager {

  public records: Records;
  public users: Users;
  public workouts: Workouts;

  private _db: sqlite3.Database;

  public async init(): Promise<void> {
    const dbPath = path.resolve(__dirname, './records.db');
    this._db = new sqlite3.Database(dbPath);

    this.records = await new Records(this).init();
    this.users = await new Users(this).init();
    this.workouts = await new Workouts(this).init();

    try {
      await this.records.addSampleData();
      await this.users.addSampleData();
      await this.workouts.addSampleData();
    } catch (err) {

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

  public async get(sql: string, params: any[] = []): Promise<{ [column: string]: any }|void> {
    const all = await this.all(sql, params);
    if (all.length > 0) {
      return all[0];
    }
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
}

const db = new DBManager();

export default db;
