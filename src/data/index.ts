import ExerciseData from './readers/ExerciseData';
import MuscleData from './readers/MuscleData';

class DataManager {

  public exercises: ExerciseData;
  public muscles: MuscleData;

  public async init(): Promise<void> {
    this.exercises = await new ExerciseData();
    this.muscles = await new MuscleData();
  }
}

const data = new DataManager();

export default data;
