import db from './db';

interface Record extends RecordBasics {
  userId: number,
  workoutId: string
}

interface RecordBasics {
  exercise: string,
  sets: number,
  reps: number,
  weight: number,
  repsCompleted: number
}

export default class Records {
  public static async add(arg: Record): Promise<void> {
    await db.run(
      `INSERT INTO records (
        user_id, workout_id, exercise, sets, reps, weight, repsCompleted
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [arg.userId, arg.workoutId, arg.exercise, arg.sets, arg.reps, arg.weight, arg.repsCompleted]
    );
  }

  public static async getForUser(userId: number): Promise<Record[]> {
    return await db.all(`SELECT * FROM records WHERE user_id = ?`, [userId]) as Record[];
  }
}
