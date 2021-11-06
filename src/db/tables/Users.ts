import Base from './Base';

export default class Users extends Base {
  public async init(): Promise<this> {
    await this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      gender TEXT,
      experience TEXT,
      primary_focus TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    return this;
  }

  public async add(arg: DBUser): Promise<void> {
    await this.db.run('INSERT INTO users (name, gender, experience, primary_focus) VALUES (?, ?, ?)',
      [arg.name, arg.gender, arg.experience, arg.primary_focus]);
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
      `INSERT INTO users (name, gender, experience, primary_focus) VALUES
      ("Kelci", "female", "beginner", "endurance"),
      ("Michael", "male", "beginner", "strength"),
      ("Vini", "male", "beginner", "strength"),
      ("Jake", "male", "intermediate", "endurance"),
      ("Yudhi", "male", "beginner", "strength")`
    );
  }
}
