import AddUser from './AddUser';
import GenerateNext from './GenerateNext';
import GetProgress from './GetProgress';
import StartGenerator from './StartGenerator';
import StopGenerator from './StopGenerator';

export const api: { [name: string]: any } = {
	AddUser,
	GenerateNext,
	GetProgress,
	StartGenerator,
	StopGenerator,
};
