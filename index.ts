import Server from './src/server/Server';
import * as dotenv from 'dotenv';

dotenv.config()

new Server().start();
