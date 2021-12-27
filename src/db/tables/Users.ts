import Base from './Base';

export default class Users extends Base {
  public async init(): Promise<this> {
    await this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      gender TEXT,
      weight INTEGER,
      experience TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    return this;
  }

  public async add(arg: DBUser): Promise<void> {
    await this.db.run('INSERT INTO users (name, gender, weight, experience)'
      + ' VALUES (?, ?, ?, ?, ?)',
      [arg.name, arg.gender, arg.weight, arg.experience]);
  }

  public async getOne(id: number): Promise<DBUser> {
  	const user = await this.db.get(`SELECT * FROM users WHERE id = ?`, [id]) as DBUser;
  	if (!user) {
  		throw new Error(`User not found for id ${id}`);
  	}
  	return user;
  }

  public async addSampleData(): Promise<void> {
    await this.db.run(
      `INSERT INTO users (name, gender, weight, experience) VALUES
      ("Kelci", "female", "180", "beginner"),
      ("Michael", "male", "180", "beginner"),
      ("Vini", "male", "180", "beginner"),
      ("Jake", "male", "180", "intermediate"),
      ("Yudhi", "male", "180", "advanced")`
    );
  }
}
