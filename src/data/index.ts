import ExerciseData from './readers/ExerciseData';
import MuscleData from './readers/MuscleData';

export default {
	exercises: new ExerciseData(),
	muscles: new MuscleData()
};
