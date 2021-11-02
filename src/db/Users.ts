import db from './db';

interface User {
  name: string,
  experience: string,
  primaryFocus: string
}

export default class Users {
  public static async add(arg: User): Promise<void> {
    await db.run('INSERT INTO users (name, experience, primary_focus) VALUES (?, ?, ?)',
      [arg.name, arg.experience, arg.primaryFocus]);
  }
}
