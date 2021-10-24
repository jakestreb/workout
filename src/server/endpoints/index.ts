import AddUser from './AddUser';
import GenerateNext from './GenerateNext';
import GetProgress from './GetProgress';
import StartGenerator from './StartGenerator';
import StopGenerator from './StopGenerator';

const api: { [name: string]: any } = {
	AddUser,
	GenerateNext,
	GetProgress,
	StartGenerator,
	StopGenerator,
};

export default api;
